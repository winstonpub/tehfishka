import { useEffect, useState } from "react";
import { FRAMES_SHEET_CSV_URL, FRAMES_SNAPSHOT_CSV } from "../data/framesSnapshot";
import { parseCsv, parseMatrix, type Matrix } from "./sheet";

function snapshotMatrix(): Matrix {
  return parseMatrix(parseCsv(FRAMES_SNAPSHOT_CSV)) ?? { hearths: [], frames: [] };
}

/** Загружает матрицу «Обрамление + Очаг»: сначала снимок, затем живая Google Таблица */
export function useMatrix() {
  const [matrix, setMatrix] = useState<Matrix>(() => snapshotMatrix());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(FRAMES_SHEET_CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const m = parseMatrix(parseCsv(await res.text()));
        if (m && !cancelled) setMatrix(m);
      } catch {
        /* остаёмся на снимке */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { matrix, loading };
}
