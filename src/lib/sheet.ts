// Разбор CSV и преобразование таблицы «Обрамление + Очаг» в матрицу совместимости

export type Hearth = { name: string; article: string };
export type Frame = { name: string; article: string; compat: boolean[] };
export type Matrix = { hearths: Hearth[]; frames: Frame[] };
export type FireplaceSet = { name: string; article: string };

/** Простой RFC4180-парсер: кавычки, запятые внутри кавычек, CRLF */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  // убираем полностью пустые строки
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const isBool = (v: string) => /^(true|false)$/i.test(v.trim());

/**
 * Структура листа:
 *  строка 1 — названия очагов (с колонки B),
 *  строка 2 — артикулы очагов,
 *  далее парами: название обрамления + TRUE/FALSE по очагам, затем строка с артикулом обрамления.
 */
export function parseMatrix(rows: string[][]): Matrix | null {
  if (rows.length < 3) return null;

  const names = rows[0].slice(1);
  const articles = rows[1].slice(1);
  const hearths: Hearth[] = [];
  names.forEach((name, i) => {
    if (name.trim()) hearths.push({ name: name.trim(), article: (articles[i] ?? "").trim() });
  });
  if (!hearths.length) return null;

  const frames: Frame[] = [];
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    const first = (row[0] ?? "").trim();
    const values = row.slice(1, 1 + hearths.length);
    if (values.some(isBool)) {
      frames.push({
        name: first,
        article: "",
        compat: hearths.map((_, i) => /^true$/i.test((values[i] ?? "").trim())),
      });
    } else if (first && frames.length && !frames[frames.length - 1].article) {
      frames[frames.length - 1].article = first;
    }
  }

  return frames.length ? { hearths, frames } : null;
}

const looksLikeArticle = (v: string) => /^\d{5,}$/.test(v.trim());

/**
 * Лист «Каминокомплект»:
 *  — либо строка названий и строка артикулов (как сейчас),
 *  — либо колонки «название / артикул» построчно.
 */
export function parseSets(rows: string[][]): FireplaceSet[] {
  if (!rows.length) return [];

  const header = rows[0] ?? [];
  const next = rows[1] ?? [];
  const headerCells = header.map((c) => c.trim()).filter(Boolean);
  const nextArticles = next.map((c) => c.trim()).filter(Boolean);

  const columnOriented =
    headerCells.length >= 2 &&
    nextArticles.length >= 2 &&
    nextArticles.filter(looksLikeArticle).length >= Math.ceil(nextArticles.length / 2);

  if (columnOriented) {
    const items: FireplaceSet[] = [];
    const width = Math.max(header.length, next.length);
    for (let i = 0; i < width; i++) {
      const name = (header[i] ?? "").trim();
      const article = (next[i] ?? "").trim();
      if (name || article) items.push({ name, article });
    }
    return items;
  }

  const items: FireplaceSet[] = [];
  for (const row of rows) {
    const cells = row.map((c) => c.trim());
    if (!cells.some(Boolean)) continue;
    // пропускаем строку-заголовок
    if (/назван/i.test(cells[0] ?? "") && /артикул/i.test(cells[1] ?? "")) continue;
    const name = cells[0] ?? "";
    const article = (cells.find((c, i) => i > 0 && looksLikeArticle(c)) ?? cells[1] ?? "").trim();
    if (name || article) items.push({ name, article });
  }
  return items;
}
