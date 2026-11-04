import { useState, type ReactNode } from "react";
import FrameSheetView from "../components/FrameSheetView";
import ProductSheetView from "../components/ProductSheetView";

type SheetMode = "frames" | "set" | "all";

const MODES: { id: SheetMode; label: string; hint: string }[] = [
  { id: "frames", label: "Обрамление + Очаг", hint: "A4 · 4 части" },
  { id: "set", label: "Каминокомплект", hint: "A5 · 2 части" },
  { id: "all", label: "Все товары", hint: "A5 · 2 части" },
];

export default function PrintSheetPage() {
  const [mode, setMode] = useState<SheetMode>("frames");

  const switcher: ReactNode = (
    <section className="rounded-2xl border border-[#e4e2da] bg-[#f9f8f4] p-4 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#1d1f1b]">Тип листа</h2>
      <div className="mt-3 space-y-2" role="group" aria-label="Тип листа">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={active}
              className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C400] focus-visible:ring-offset-2 ${
                active
                  ? "border-[#24251f] bg-[#24251f] text-white"
                  : "border-[#d8d8cf] bg-white text-[#56574f] hover:border-[#F5C400] hover:bg-[#FFF8D6]"
              }`}
            >
              <span className="min-w-0 flex-1 truncate font-medium">{m.label}</span>
              <span className={`shrink-0 text-[11px] ${active ? "text-[#F5C400]" : "text-[#9a9a90]"}`}>{m.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <>
      {/* Размер печатной страницы зависит от выбранного типа листа */}
      <style>{mode === "frames" ? "@page{size:A4 landscape;margin:0}" : "@page{size:A5 portrait;margin:0}"}</style>
      {mode === "frames" ? (
        <FrameSheetView switcher={switcher} />
      ) : (
        <ProductSheetView
          key={mode}
          switcher={switcher}
          catalog={mode === "set" ? "sets" : "all"}
        />
      )}
    </>
  );
}
