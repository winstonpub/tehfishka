import { useEffect, useMemo, useRef, useState } from "react";

export type DropOption = { value: string; label: string; sub?: string };

export default function SelectDrop({
  value,
  displayValue,
  placeholder = "Выбрать",
  options,
  disabled,
  loading,
  searchPlaceholder = "Поиск…",
  emptyText = "Ничего не найдено",
  onSelect,
}: {
  value: string | null;
  /** Что показать в кнопке, если value — служебный ключ */
  displayValue?: string | null;
  placeholder?: string;
  options: DropOption[];
  disabled?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || (o.sub ?? "").toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-[#d8d8cf] bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C400] ${
          disabled ? "cursor-not-allowed opacity-50" : "hover:border-[#F5C400] hover:bg-[#FFF8D6]"
        } ${value ? "text-[#1d1f1b]" : "text-[#9a9a90]"}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {displayValue ?? value ?? (loading ? "Загрузка…" : placeholder)}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-[#7b7c73] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-[#e4e2da] bg-white shadow-[0_18px_40px_-12px_rgba(29,31,27,0.28)]">
          <div className="border-b border-[#f1f0ea] p-2">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[#d8d8cf] bg-white px-3 py-1.5 text-sm text-[#1d1f1b] outline-none placeholder:text-[#9a9a90] focus:border-[#F5C400] focus:ring-2 focus:ring-[#F5C400]/40"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-auto p-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-[#9a9a90]">{emptyText}</li>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onSelect(o.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                        active ? "bg-[#FFF8D6]" : "hover:bg-[#f4f3ee]"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#1d1f1b]">{o.label}</span>
                        {o.sub && <span className="block truncate text-xs tabular-nums text-[#7b7c73]">{o.sub}</span>}
                      </span>
                      {active && (
                        <svg
                          className="h-4 w-4 shrink-0 text-[#8a6d00]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
