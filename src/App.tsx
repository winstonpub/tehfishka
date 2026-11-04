import { useEffect, useState } from "react";
import "@fontsource-variable/unbounded";
import { BrandMenu, type PageLink } from "./components/BrandMenu";
import PrintSheetPage from "./pages/PrintSheetPage";
import FramesPage from "./pages/FramesPage";

const PAGES: PageLink[] = [
  {
    id: "print",
    title: "Техфишка",
    subtitle: "Печать листа A4",
    hash: "#/",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
  },
  {
    id: "frames",
    title: "Камины",
    subtitle: "Таблица совместимости",
    hash: "#/obramlenie-ochag",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M9 4v16" />
      </svg>
    ),
  },
];

function resolvePage(hash: string): PageLink {
  const clean = hash.replace(/^#/, "").replace(/\/+$/, "") || "/";
  return PAGES.find((p) => p.hash.replace(/^#/, "").replace(/\/+$/, "") === clean) ?? PAGES[0];
}

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const page = resolvePage(hash);

  useEffect(() => {
    document.title = `Техфишка Камины — ${page.title}`;
    window.scrollTo({ top: 0 });
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="no-print sticky top-0 z-30 border-b border-[#e4e2da] bg-[#f1efe9]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-2 py-2.5 sm:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <BrandMenu pages={PAGES} currentId={page.id} />
            <h1 className="brand-wordmark">
              Техфишка <span className="brand-wordmark-accent">Камины</span>
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#e4e2da] bg-white/70 py-1 pl-2 pr-3 text-xs text-[#56574f] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#F5C400]" aria-hidden="true" />
            {page.title}
          </div>
        </div>
      </header>

      {page.id === "frames" ? <FramesPage /> : <PrintSheetPage />}
    </div>
  );
}
