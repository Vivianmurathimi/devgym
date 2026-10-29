import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

// Load data from the API and get a reload() function to refresh after changes.
export function useData<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!url) return;
    try {
      setData(await api.get<T>(url));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [url]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload };
}
