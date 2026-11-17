import { useEffect, useState } from "react";
import { api, parseApiError } from "@/lib/api";
import { useRosterStore } from "./store";

/** Loads run metadata (labels, params, duty, rule references) once per page visit. */
export function useRunsMeta() {
  const meta = useRosterStore((s) => s.meta);
  const setMeta = useRosterStore((s) => s.setMeta);
  const [loading, setLoading] = useState(!meta);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .listRosterRuns()
      .then((res) => alive && setMeta(res.data.runs))
      .catch(async (e) => {
        if (!alive) return;
        setError((await parseApiError(e, "Couldn't load the roster tools.")).message);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { meta, loading: loading && !meta, error };
}
