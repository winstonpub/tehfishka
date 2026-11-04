import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FRAMES_SHEET_CSV_URL,
  FRAMES_SHEET_URL,
  FRAMES_SNAPSHOT_CSV,
  FRAMES_SNAPSHOT_DATE,
} from "../data/framesSnapshot";
import { parseCsv, parseMatrix, type Matrix } from "../lib/sheet";
import { useSets } from "../lib/useSets";
import { SETS_SNAPSHOT_DATE } from "../data/setsSnapshot";

type DataState = {
  matrix: Matrix;
  source: "live" | "snapshot";
  updatedAt?: Date;
  error?: string;
};

const snapshotMatrix = (): Matrix => {
  const m = parseMatrix(parseCsv(FRAMES_SNAPSHOT_CSV));
  return m ?? { hearths: [], frames: [] };
};

const fmtTime = (d: Date) => d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export default function FramesPage() {
  const [data, setData] = useState<DataState>(() => ({ matrix: snapshotMatrix(), source: "snapshot" }));
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [hearthIdx, setHearthIdx] = useState(-1);
  const [setsQuery, setSetsQuery] = useState("");
  const setsState = useSets();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(FRAMES_SHEET_CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const matrix = parseMatrix(parseCsv(await res.text()));
      if (!matrix) throw new Error("не удалось распознать структуру таблицы");
      setData({ matrix, source: "live", updatedAt: new Date() });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setData((prev) => ({ ...prev, error: msg }));
    } finally {
      setLoading(false);
    }
    void setsState.reload();
  }, [setsState.reload]);

  useEffect(() => {
    load();
  }, [load]);

  const { hearths, frames } = data.matrix;

  // Если после обновления данных колонок стало меньше — сбрасываем фильтр
  useEffect(() => {
    if (hearthIdx >= hearths.length) setHearthIdx(-1);
  }, [hearths.length, hearthIdx]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return frames
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => hearthIdx < 0 || f.compat[hearthIdx])
      .filter(({ f }) => !q || f.name.toLowerCase().includes(q) || f.article.toLowerCase().includes(q));
  }, [frames, query, hearthIdx]);

  const selectedHearth = hearthIdx >= 0 ? hearths[hearthIdx] : null;

  return (
    <main className="frames-page mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-6 sm:py-8">
      {/* Заголовок */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1d1f1b] sm:text-3xl">Камины</h2>
        </div>
        <div className="no-print flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#d8d8cf] bg-white px-3 py-2 text-sm text-[#56574f] transition-colors hover:bg-[#FFF8D6] disabled:opacity-60"
          >
            <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 11-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            Обновить
          </button>
          <a
            href={FRAMES_SHEET_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#24251f] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#414339]"
          >
            Открыть в Google Таблицах
            <svg className="h-3.5 w-3.5 text-[#F5C400]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>

      {/* Статус источника */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {loading ? (
          <span className="flex items-center gap-2 text-[#7b7c73]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5C400]" />
            Загружаем данные из Google Таблицы…
          </span>
        ) : data.source === "live" ? (
          <span className="flex items-center gap-2 text-[#7b7c73]">
            <span className="h-2 w-2 rounded-full bg-[#F5C400]" />
            Данные из Google Таблицы · обновлено {data.updatedAt ? fmtTime(data.updatedAt) : ""}
          </span>
        ) : (
          <span className="flex items-center gap-2 text-[#8a6d00]">
            <span className="h-2 w-2 rounded-full bg-[#F5C400]" />
            Не удалось загрузить Google Таблицу{data.error ? ` (${data.error})` : ""} — показана сохранённая копия от{" "}
            {fmtDate(FRAMES_SNAPSHOT_DATE)}
          </span>
        )}
      </div>

      {/* Фильтры */}
      <div className="no-print mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Поиск обрамления</span>
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9a90]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или артикулу обрамления"
            className="w-full rounded-lg border border-[#d8d8cf] bg-white py-2 pl-9 pr-3 text-sm text-[#1d1f1b] outline-none transition placeholder:text-[#9a9a90] focus:border-[#F5C400] focus:ring-2 focus:ring-[#F5C400]/40"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[#56574f]">
          <span className="shrink-0">Очаг:</span>
          <select
            value={hearthIdx}
            onChange={(e) => setHearthIdx(Number(e.target.value))}
            className="w-full rounded-lg border border-[#d8d8cf] bg-white px-3 py-2 text-sm text-[#1d1f1b] outline-none transition focus:border-[#F5C400] focus:ring-2 focus:ring-[#F5C400]/40 sm:w-64"
          >
            <option value={-1}>Все очаги</option>
            {hearths.map((h, i) => (
              <option key={`${h.name}-${i}`} value={i}>
                {h.name}
                {h.article ? ` · ${h.article}` : ""}
              </option>
            ))}
          </select>
        </label>
        {(query || hearthIdx >= 0) && (
          <button
            onClick={() => {
              setQuery("");
              setHearthIdx(-1);
            }}
            className="text-sm text-[#56574f] underline decoration-[#F5C400] decoration-2 underline-offset-4 hover:text-[#1d1f1b]"
          >
            Сбросить
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-[#7b7c73]">
        {selectedHearth ? (
          <>
            Подходящие обрамления для <span className="font-semibold text-[#1d1f1b]">{selectedHearth.name}</span>:{" "}
            <span className="font-semibold text-[#1d1f1b]">{visible.length}</span>
          </>
        ) : (
          <>
            Показано <span className="font-semibold text-[#1d1f1b]">{visible.length}</span> из {frames.length}
          </>
        )}
      </div>

      {/* Таблица */}
      <div className="matrix-wrap mt-3 overflow-auto rounded-2xl border border-[#e4e2da] bg-white shadow-sm">
        <table className="matrix w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="corner">
                <div className="flex h-full flex-col justify-end">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9a9a90]">Очаг →</span>
                  <span className="mt-1 text-sm font-bold text-[#1d1f1b]">Обрамление ↓</span>
                  <span className="text-[11px] text-[#9a9a90]">название · артикул</span>
                </div>
              </th>
              {hearths.map((h, i) => (
                <th
                  key={`${h.name}-${i}`}
                  className={`hearth ${hearthIdx === i ? "is-selected" : ""}`}
                  title={`${h.name}${h.article ? ` · ${h.article}` : ""}. Нажмите, чтобы показать подходящие обрамления`}
                >
                  <button
                    type="button"
                    onClick={() => setHearthIdx(hearthIdx === i ? -1 : i)}
                    aria-pressed={hearthIdx === i}
                    className="hearth-btn"
                  >
                    <span className="hearth-label">
                      <span className="hearth-name">{h.name}</span>
                      <span className="hearth-article">{h.article}</span>
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={hearths.length + 1} className="px-4 py-10 text-center text-sm text-[#7b7c73]">
                  Ничего не найдено. Измените запрос или сбросьте фильтр.
                </td>
              </tr>
            ) : (
              visible.map(({ f, i }) => (
                <tr key={`${f.name}-${f.article}-${i}`}>
                  <th scope="row" className="frame">
                    <span className="block truncate font-medium text-[#1d1f1b]">{f.name || "—"}</span>
                    <span className="block text-xs tabular-nums text-[#7b7c73]">{f.article || "без артикула"}</span>
                  </th>
                  {hearths.map((h, j) => (
                    <td key={`${h.name}-${j}`} className={`cell ${hearthIdx === j ? "is-selected" : ""}`}>
                      {f.compat[j] ? (
                        <span className="chip-yes" aria-label="подходит">
                          <CheckIcon />
                        </span>
                      ) : (
                        <span className="chip-no" aria-label="не подходит">
                          ·
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Каминокомплекты — второй лист таблицы */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#1d1f1b] sm:text-2xl">Каминокомплект</h3>
            <p className="mt-1 text-sm text-[#7b7c73]">
              {setsState.loading
                ? "Загружаем лист «Каминокомплект»…"
                : setsState.source === "live"
                  ? `Товары из второго листа Google Таблицы${setsState.updatedAt ? ` · обновлено ${fmtTime(setsState.updatedAt)}` : ""}`
                  : `Не удалось загрузить лист${setsState.error ? ` (${setsState.error})` : ""} — копия от ${fmtDate(SETS_SNAPSHOT_DATE)}`}
            </p>
          </div>
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Поиск каминокомплекта</span>
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9a90]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={setsQuery}
              onChange={(e) => setSetsQuery(e.target.value)}
              placeholder="Поиск по названию или артикулу"
              className="w-full rounded-lg border border-[#d8d8cf] bg-white py-2 pl-9 pr-3 text-sm text-[#1d1f1b] outline-none transition placeholder:text-[#9a9a90] focus:border-[#F5C400] focus:ring-2 focus:ring-[#F5C400]/40"
            />
          </label>
        </div>

        <div className="mt-3 overflow-auto rounded-2xl border border-[#e4e2da] bg-white shadow-sm">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[#f9f8f4] text-left text-xs uppercase tracking-wider text-[#9a9a90]">
                <th className="border-b border-[#e4e2da] px-4 py-3 font-semibold">Название</th>
                <th className="border-b border-[#e4e2da] px-4 py-3 font-semibold">Артикул</th>
              </tr>
            </thead>
            <tbody>
              {setsState.sets
                .filter((s) => {
                  const q = setsQuery.trim().toLowerCase();
                  return !q || s.name.toLowerCase().includes(q) || s.article.toLowerCase().includes(q);
                })
                .map((s, i) => (
                  <tr key={`${s.article}-${s.name}-${i}`} className="odd:bg-white even:bg-[#fcfbf8]">
                    <td className="border-b border-[#f1f0ea] px-4 py-2.5 font-medium text-[#1d1f1b]">{s.name || "—"}</td>
                    <td className="border-b border-[#f1f0ea] px-4 py-2.5 tabular-nums text-[#56574f]">{s.article || "—"}</td>
                  </tr>
                ))}
              {setsState.sets.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-sm text-[#7b7c73]">
                    Лист «Каминокомплект» пуст.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
