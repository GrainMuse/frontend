import { useCallback, useEffect, useState } from "react";
import {
  fetchPublishedProgram,
  fetchPublishedPrograms,
  fetchPublishedResourcePerson,
} from "../services/academyService";

export function useAcademyPrograms() {
  return useAcademyRequest(fetchPublishedPrograms, []);
}

export function useAcademyProgram(slug) {
  return useAcademyRequest(() => fetchPublishedProgram(slug), [slug]);
}

export function useAcademyResourcePerson(slug) {
  return useAcademyRequest(() => fetchPublishedResourcePerson(slug), [slug]);
}

function useAcademyRequest(request, dependencies) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await request());
    } catch {
      setError("We could not load the latest PATHFINDER Academy information.");
    } finally {
      setLoading(false);
    }
  // The caller supplies stable primitive dependencies for its request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
