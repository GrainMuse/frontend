import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPublicContent } from "../services/contentService";
import { ContentContext } from "./contentStore";

const EMPTY_CONTENT = Object.freeze({
  categories: [],
  products: [],
  teamMembers: [],
  company: { socials: {} },
  navLinks: [],
  values: [],
  processSteps: [],
});

export function ContentProvider({ children }) {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchPublicContent({ force: true }));
    } catch {
      setError("We could not load the latest site content. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchPublicContent()
      .then((nextContent) => {
        if (active) setContent(nextContent);
      })
      .catch(() => {
        if (active) {
          setError("We could not load the latest site content. Please try again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ ...content, loading, error, reload }),
    [content, loading, error, reload],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
