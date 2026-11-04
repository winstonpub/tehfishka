import { useEffect, useMemo, useState, type ReactNode } from "react";
import PhotoCell, { type Fit } from "./PhotoCell";
import SelectDrop, { type DropOption } from "./SelectDrop";
import { getProductImageFilename, getProductImagePath } from "../lib/productImage";
import { useMatrix } from "../lib/useMatrix";

const load = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

function PriceCell({ name, article }: { name: string | null; article: string | null }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {name || article ? (
        <div className="max-w-[90%] text-center leading-snug">
          {name && <div className="break-words text-[11pt] font-semibold text-[#1d1f1b]">{name}</div>}
          {article && <div className="mt-1 text-[9pt] tabular-nums text-[#56574f]">{article}</div>}
        </div>
      ) : (
        <span className="text-[9pt] text-slate-500">место для ценника</span>
      )}
    </div>
  );
}

export default function FrameSheetView({ switcher }: { switcher: ReactNode }) {
  const [photo1, setPhoto1] = useState<string | null>(() => load("tf_photo1"));
  const [photo2, setPhoto2] = useState<string | null>(() => load("tf_photo2"));
  const [photo1OverrideArticle, setPhoto1OverrideArticle] = useState<string | null>(() => load("tf_photo1_override_article"));
  const [photo2OverrideArticle, setPhoto2OverrideArticle] = useState<string | null>(() => load("tf_photo2_override_article"));
  const [fit, setFit] = useState<Fit>("contain");
  const [lines, setLines] = useState(false);
  const [frameName, setFrameName] = useState<string | null>(() => load("tf_frame"));
  const [hearthName, setHearthName] = useState<string | null>(() => load("tf_hearth"));
  const { matrix, loading: matrixLoading } = useMatrix();

  useEffect(() => {
    try {
      photo1 ? localStorage.setItem("tf_photo1", photo1) : localStorage.removeItem("tf_photo1");
      photo2 ? localStorage.setItem("tf_photo2", photo2) : localStorage.removeItem("tf_photo2");
      photo1OverrideArticle
        ? localStorage.setItem("tf_photo1_override_article", photo1OverrideArticle)
        : localStorage.removeItem("tf_photo1_override_article");
      photo2OverrideArticle
        ? localStorage.setItem("tf_photo2_override_article", photo2OverrideArticle)
        : localStorage.removeItem("tf_photo2_override_article");
    } catch {
      /* слишком большой файл — пропускаем */
    }
  }, [photo1, photo2, photo1OverrideArticle, photo2OverrideArticle]);

  const { frames, hearths } = matrix;

  const selectedFrame = useMemo(() => frames.find((f) => f.name === frameName) ?? null, [frames, frameName]);

  const compatibleHearths = useMemo(() => {
    if (!selectedFrame) return [];
    return hearths.filter((_, i) => selectedFrame.compat[i]);
  }, [hearths, selectedFrame]);

  useEffect(() => {
    try {
      frameName ? localStorage.setItem("tf_frame", frameName) : localStorage.removeItem("tf_frame");
    } catch {
      /* ignore */
    }
  }, [frameName]);

  useEffect(() => {
    try {
      hearthName ? localStorage.setItem("tf_hearth", hearthName) : localStorage.removeItem("tf_hearth");
    } catch {
      /* ignore */
    }
  }, [hearthName]);

  // Если обрамление сменилось и очаг к нему не подходит — сбрасываем очаг
  useEffect(() => {
    if (!selectedFrame || !hearthName) return;
    const stillOk = hearths.some((h, i) => h.name === hearthName && selectedFrame.compat[i]);
    if (!stillOk) {
      setHearthName(null);
      setPhoto2(null);
      setPhoto2OverrideArticle(null);
    }
  }, [selectedFrame, hearthName, hearths]);

  const selectedHearth = hearths.find((hearth) => hearth.name === hearthName) ?? null;

  const handleFrameSelect = (name: string) => {
    setFrameName(name);
    setPhoto1(null);
    setPhoto1OverrideArticle(null);

    const nextFrame = frames.find((frame) => frame.name === name);
    const currentHearthIndex = hearths.findIndex((hearth) => hearth.name === hearthName);
    if (!nextFrame || currentHearthIndex < 0 || !nextFrame.compat[currentHearthIndex]) {
      setHearthName(null);
      setPhoto2(null);
      setPhoto2OverrideArticle(null);
    }
  };

  const handleHearthSelect = (name: string) => {
    setHearthName(name);
    setPhoto2(null);
    setPhoto2OverrideArticle(null);
  };

  const handlePhoto1Upload = (url: string | null) => {
    setPhoto1(url);
    setPhoto1OverrideArticle(url ? selectedFrame?.article || null : null);
  };

  const handlePhoto2Upload = (url: string | null) => {
    setPhoto2(url);
    const article = hearths.find((hearth) => hearth.name === hearthName)?.article;
    setPhoto2OverrideArticle(url ? article || null : null);
  };

  const clearUpperPhoto = () => {
    setPhoto1(null);
    setPhoto1OverrideArticle(null);
    setFrameName(null);
    setHearthName(null);
    setPhoto2(null);
    setPhoto2OverrideArticle(null);
  };

  const clearLowerPhoto = () => {
    setPhoto2(null);
    setPhoto2OverrideArticle(null);
    setHearthName(null);
  };

  const frameOptions: DropOption[] = useMemo(
    () =>
      frames.map((f) => ({
        value: f.name,
        label: f.name || "Без названия",
        sub: f.article ? `Артикул: ${f.article}` : undefined,
      })),
    [frames]
  );

  const hearthOptions: DropOption[] = useMemo(
    () =>
      compatibleHearths.map((h) => ({
        value: h.name,
        label: h.name,
        sub: h.article ? `Артикул: ${h.article}` : undefined,
      })),
    [compatibleHearths]
  );

  const frameImagePath = selectedFrame?.article ? getProductImagePath(selectedFrame.article) : null;
  const hearthImagePath = selectedHearth?.article ? getProductImagePath(selectedHearth.article) : null;
  const photo1Src = selectedFrame?.article
    ? photo1 && photo1OverrideArticle === selectedFrame.article
      ? photo1
      : frameImagePath
    : photo1;
  const photo2Src = selectedHearth?.article
    ? photo2 && photo2OverrideArticle === selectedHearth.article
      ? photo2
      : hearthImagePath
    : photo2;

  const lineColor = lines ? "#9ca3af" : "transparent";
  const hasPhotos = Boolean(photo1 || photo2 || selectedFrame || selectedHearth);

  return (
    <main className="print-wrap mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-3 py-5 md:flex-row md:items-start md:gap-6 sm:px-6 sm:py-8">
      <aside className="no-print w-full shrink-0 space-y-4 md:sticky md:top-[76px] md:w-72">
        {switcher}

        <section className="rounded-2xl border border-[#e4e2da] bg-[#f9f8f4] p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1d1f1b]">Параметры листа</h2>
          <p className="mt-1 text-xs text-[#7b7c73]">A4 · альбомная · 4 части</p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[#56574f]">Верхнее фото</div>
              <SelectDrop
                value={frameName}
                options={frameOptions}
                loading={matrixLoading}
                searchPlaceholder="Поиск обрамления…"
                emptyText={matrixLoading ? "Загружаем список…" : "Обрамления не найдены"}
                onSelect={handleFrameSelect}
              />
              {selectedFrame?.article && (
                <div className="mt-1 truncate text-[11px] tabular-nums text-[#9a9a90]">
                  Артикул: {selectedFrame.article} · подходит очагов: {compatibleHearths.length}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[#56574f]">Нижнее фото</div>
              <SelectDrop
                value={hearthName}
                options={hearthOptions}
                loading={matrixLoading}
                disabled={!selectedFrame}
                searchPlaceholder="Поиск очага…"
                emptyText={!selectedFrame ? "Сначала выберите обрамление" : "Нет подходящих очагов"}
                onSelect={handleHearthSelect}
              />
              {!selectedFrame ? (
                <div className="mt-1 text-[11px] leading-snug text-[#9a9a90]">
                  Сначала выберите верхнее фото — покажем подходящие очаги.
                </div>
              ) : (
                hearthName &&
                (() => {
                  const h = hearths.find((x) => x.name === hearthName);
                  return h?.article ? (
                    <div className="mt-1 truncate text-[11px] tabular-nums text-[#9a9a90]">Артикул: {h.article}</div>
                  ) : null;
                })()
              )}
            </div>

            {(frameName || hearthName) && (
              <button
                type="button"
                onClick={() => {
                  setFrameName(null);
                  setHearthName(null);
                  setPhoto1(null);
                  setPhoto2(null);
                  setPhoto1OverrideArticle(null);
                  setPhoto2OverrideArticle(null);
                }}
                className="text-xs text-[#56574f] underline decoration-[#F5C400] decoration-2 underline-offset-4 hover:text-[#1d1f1b]"
              >
                Сбросить выбор
              </button>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 text-xs font-medium text-[#56574f]">Размещение фото</div>
            <div
              className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#d8d8cf] text-sm"
              role="group"
              aria-label="Размещение фото"
            >
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
                <path d="M4 12h3M10 12h4M17 12h3" />
                <path d="M12 4v3M12 10v4M12 17v3" />
              </svg>
              Линии разреза
            </span>
            <input
              type="checkbox"
              checked={lines}
              onChange={(e) => setLines(e.target.checked)}
              className="h-4 w-4 accent-[#F5C400]"
            />
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

          <button
            onClick={clearUpperPhoto}
            disabled={!hasPhotos}
            className="mt-2 w-full rounded-lg border border-[#d8d8cf] bg-white px-4 py-2 text-sm text-[#56574f] transition-colors hover:bg-[#FFF8D6] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            Очистить фото
          </button>

          <p className="mt-3 text-[11px] leading-snug text-[#9a9a90]">
            В окне печати выберите ориентацию «Альбомная» и поля «Нет».
          </p>
        </section>
      </aside>

      <div className="sheet-stage flex min-w-0 flex-1 justify-center">
        <div className="sheet grid shrink-0 bg-white shadow-xl" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
          <div style={{ borderRight: `0.3mm dashed ${lineColor}`, borderBottom: `0.3mm dashed ${lineColor}` }}>
            <PhotoCell
              src={photo1Src}
              onChange={handlePhoto1Upload}
              onClear={clearUpperPhoto}
              fit={fit}
              label={selectedFrame?.name || "Фото 1"}
              missingFileName={selectedFrame?.article ? getProductImageFilename(selectedFrame.article) : null}
            />
          </div>
          <div style={{ borderBottom: `0.3mm dashed ${lineColor}` }}>
            <PriceCell name={selectedFrame?.name ?? null} article={selectedFrame?.article ?? null} />
          </div>
          <div style={{ borderRight: `0.3mm dashed ${lineColor}` }}>
            <PhotoCell
              src={photo2Src}
              onChange={handlePhoto2Upload}
              onClear={clearLowerPhoto}
              fit={fit}
              label={selectedHearth?.name || "Фото 2"}
              missingFileName={selectedHearth?.article ? getProductImageFilename(selectedHearth.article) : null}
            />
          </div>
          <div>
            <PriceCell name={selectedHearth?.name ?? null} article={selectedHearth?.article ?? null} />
          </div>
        </div>
      </div>
    </main>
  );
}
