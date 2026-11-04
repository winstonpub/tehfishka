import { useEffect, useMemo, useState, type ReactNode } from "react";
import PhotoCell, { type Fit } from "./PhotoCell";
import SelectDrop, { type DropOption } from "./SelectDrop";
import { getProductImageFilename, getProductImagePath } from "../lib/productImage";
import { useMatrix } from "../lib/useMatrix";
import { useSets } from "../lib/useSets";

type Product = { key: string; kind: string; name: string; article: string };
export type ProductCatalog = "sets" | "all";

const load = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

function PriceCell({ name, article }: { name: string | null; article: string | null }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      {name || article ? (
        <div className="max-w-full text-center leading-snug">
          {name && <div className="break-words text-[12pt] font-semibold text-[#1d1f1b]">{name}</div>}
          {article && <div className="mt-1 text-[9pt] tabular-nums text-[#56574f]">{article}</div>}
        </div>
      ) : (
        <span className="text-[9pt] text-slate-500">место для ценника</span>
      )}
    </div>
  );
}

export default function ProductSheetView({
  switcher,
  catalog = "all",
}: {
  switcher: ReactNode;
  catalog?: ProductCatalog;
}) {
  const { matrix, loading: matrixLoading } = useMatrix();
  const { sets, loading: setsLoading } = useSets();
  const storageKey = catalog === "sets" ? "tf_set_product" : "tf_single_product";
  const photoKey = catalog === "sets" ? "tf_set_photo" : "tf_single_photo";
  const [productKey, setProductKey] = useState<string | null>(() => load(storageKey));
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => load(photoKey));
  const [fit, setFit] = useState<Fit>("contain");
  const [lines, setLines] = useState(false);
  const listLoading = catalog === "sets" ? setsLoading : matrixLoading;

  const products: Product[] = useMemo(() => {
    if (catalog === "sets") {
      return sets.map<Product>((s, i) => ({
        key: `set:${s.article || s.name || i}`,
        kind: "Каминокомплект",
        name: s.name,
        article: s.article,
      }));
    }
    return [
      ...matrix.frames.map<Product>((f) => ({ key: `frame:${f.name}`, kind: "Обрамление", name: f.name, article: f.article })),
      ...matrix.hearths.map<Product>((h) => ({ key: `hearth:${h.name}`, kind: "Очаг", name: h.name, article: h.article })),
    ];
  }, [catalog, sets, matrix]);

  const selected = useMemo(() => products.find((p) => p.key === productKey) ?? null, [products, productKey]);

  useEffect(() => {
    try {
      productKey ? localStorage.setItem(storageKey, productKey) : localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [productKey, storageKey]);

  useEffect(() => {
    try {
      customPhoto ? localStorage.setItem(photoKey, customPhoto) : localStorage.removeItem(photoKey);
    } catch {
      /* слишком большой файл — пропускаем */
    }
  }, [customPhoto, photoKey]);

  // Если список товаров обновился и выбранный пропал — сбрасываем
  useEffect(() => {
    if (productKey && products.length && !products.some((p) => p.key === productKey)) {
      setProductKey(null);
    }
  }, [products, productKey]);

  const options: DropOption[] = useMemo(
    () =>
      products.map((p) => ({
        value: p.key,
        label: p.name || "Без названия",
        sub: [p.kind, p.article ? `Артикул: ${p.article}` : null].filter(Boolean).join(" · "),
      })),
    [products]
  );

  const imagePath = selected?.article ? getProductImagePath(selected.article) : null;
  const photoSrc = customPhoto ?? imagePath;
  const hasContent = Boolean(selected || customPhoto);
  const lineColor = lines ? "#9ca3af" : "transparent";

  const handleUpload = (url: string | null) => {
    setCustomPhoto(url);
    if (url) setProductKey(null);
  };

  const reset = () => {
    setProductKey(null);
    setCustomPhoto(null);
  };

  return (
    <main className="print-wrap mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-3 py-5 md:flex-row md:items-start md:gap-6 sm:px-6 sm:py-8">
      <aside className="no-print w-full shrink-0 space-y-4 md:sticky md:top-[76px] md:w-72">
        {switcher}

        <section className="rounded-2xl border border-[#e4e2da] bg-[#f9f8f4] p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1d1f1b]">Параметры листа</h2>
          <p className="mt-1 text-xs text-[#7b7c73]">A5 · книжная · 2 части</p>

          <div className="mt-4">
            <div className="mb-1.5 text-xs font-medium text-[#56574f]">Выбрать фото</div>
            <SelectDrop
              value={productKey}
              displayValue={selected?.name ?? null}
              options={options}
              loading={listLoading}
              searchPlaceholder="Поиск товара или артикула…"
              emptyText={listLoading ? "Загружаем список…" : "Товары не найдены"}
              onSelect={setProductKey}
            />
            {hasContent && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-[#d8d8cf] bg-white px-3 py-2 text-xs font-medium text-[#56574f] transition-colors hover:bg-[#FFF8D6]"
                >
                  Сбросить
                </button>
              </div>
            )}
            {customPhoto && <div className="mt-2 text-[11px] leading-snug text-[#9a9a90]">Загружено своё изображение — оно заменяет фото по артикулу.</div>}
            {selected?.article && !customPhoto && (
              <div className="mt-2 truncate text-[11px] tabular-nums text-[#9a9a90]">Файл: {getProductImageFilename(selected.article)}</div>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 text-xs font-medium text-[#56574f]">Размещение фото</div>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#d8d8cf] text-sm" role="group" aria-label="Размещение фото">
              <button
                onClick={() => setFit("contain")}
                aria-pressed={fit === "contain"}
                className={`whitespace-nowrap px-2 py-2 transition-colors ${
                  fit === "contain" ? "bg-[#24251f] text-white" : "bg-white text-[#56574f] hover:bg-[#FFF8D6]"
                }`}
              >
                Вписать фото
              </button>
              <button
                onClick={() => setFit("cover")}
                aria-pressed={fit === "cover"}
                className={`whitespace-nowrap border-l border-[#d8d8cf] px-2 py-2 transition-colors ${
                  fit === "cover" ? "bg-[#24251f] text-white" : "bg-white text-[#56574f] hover:bg-[#FFF8D6]"
                }`}
              >
                Заполнить
              </button>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#d8d8cf] bg-white px-3 py-2.5 text-sm text-[#1d1f1b] transition-colors hover:bg-[#FFF8D6]">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#7b7c73]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 12h16" />
                <path d="M12 4v16" />
              </svg>
              Линия разреза
            </span>
            <input type="checkbox" checked={lines} onChange={(e) => setLines(e.target.checked)} className="h-4 w-4 accent-[#F5C400]" />
          </label>

          <button
            onClick={() => window.print()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#24251f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#414339] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C400] focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4 text-[#F5C400]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Печать
          </button>

          <p className="mt-3 text-[11px] leading-snug text-[#9a9a90]">
            В окне печати выберите формат A5 и книжную ориентацию.
          </p>
        </section>
      </aside>

      <div className="sheet-stage flex min-w-0 flex-1 justify-center">
        <div className="sheet sheet--a5 grid shrink-0 grid-rows-2 bg-white shadow-xl">
          <div style={{ borderBottom: `0.3mm dashed ${lineColor}` }}>
            <PhotoCell
              src={photoSrc}
              onChange={handleUpload}
              onClear={reset}
              fit={fit}
              label={selected?.name || "Фото товара"}
              missingFileName={selected?.article ? getProductImageFilename(selected.article) : null}
            />
          </div>
          <div>
            <PriceCell name={customPhoto ? null : selected?.name ?? null} article={customPhoto ? null : selected?.article ?? null} />
          </div>
        </div>
      </div>
    </main>
  );
}
