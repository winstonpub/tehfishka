import { useEffect, useRef, useState, type ReactNode } from "react";

export type PageLink = {
  id: string;
  title: string;
  subtitle: string;
  hash: string;
  icon: ReactNode;
};

export function BrandMenu({
  pages,
  currentId,
}: {
  pages: PageLink[];
  currentId: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Закрытие по клику снаружи и по Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Фокус на активный пункт при открытии
  useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      pages.findIndex((p) => p.id === currentId)
    );
    itemRefs.current[idx]?.focus();
  }, [open, pages, currentId]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = itemRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Разделы сайта"
        title="Разделы сайта"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`brand-mark ${open ? "brand-mark-open" : ""}`}
      >
        <span className="brand-mark-grid" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="brand-mark-dot" aria-hidden="true" />
        <span className={`brand-mark-chevron ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <svg viewBox="0 0 10 6" width="8" height="5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l4 4 4-4" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Разделы"
          onKeyDown={onMenuKeyDown}
          className="brand-menu absolute left-0 top-[calc(100%+10px)] z-50 w-[280px] overflow-hidden rounded-2xl border border-[#e4e2da] bg-white p-1.5 shadow-[0_18px_40px_-12px_rgba(29,31,27,0.28)]"
        >
          <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[#9a9a90]">
            Разделы
          </div>
          {pages.map((p, i) => {
            const active = p.id === currentId;
            return (
              <a
                key={p.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                role="menuitem"
                aria-current={active ? "page" : undefined}
                href={p.hash}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#F5C400] ${
                  active ? "bg-[#FFF8D6]" : "hover:bg-[#f4f3ee]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-[#F5C400] text-[#1d1f1b]" : "bg-[#1d1f1b] text-white"
                  }`}
                >
                  {p.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#1d1f1b]">{p.title}</span>
                  <span className="block truncate text-xs text-[#7b7c73]">{p.subtitle}</span>
                </span>
                {active && <span className="h-2 w-2 shrink-0 rounded-full bg-[#F5C400]" aria-hidden="true" />}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
