import { useCallback, useEffect, useState } from "react";
import { SETS_SHEET_CSV_URL, SETS_SNAPSHOT_CSV } from "../data/setsSnapshot";
import { parseCsv, parseSets, type FireplaceSet } from "./sheet";

function snapshotSets(): FireplaceSet[] {
  return parseSets(parseCsv(SETS_SNAPSHOT_CSV));
}

/** Загружает лист «Каминокомплект»: сначала снимок, затем живая Google Таблица */
export function useSets() {
  const [sets, setSets] = useState<FireplaceSet[]>(() => snapshotSets());
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "snapshot">("snapshot");
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(SETS_SHEET_CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = parseSets(parseCsv(await res.text()));
      if (!parsed.length) throw new Error("лист пуст");
      setSets(parsed);
      setSource("live");
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { sets, loading, source, error, updatedAt, reload };
}
