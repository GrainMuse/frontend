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

const RETRY_DELAYS_MS = [400, 1200];
const CONTENT_REQUEST_TIMEOUT_MS = 5000;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchContentWithRetry({ force = false } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      CONTENT_REQUEST_TIMEOUT_MS,
    );

    try {
      return await fetchPublicContent({
        force: force || attempt > 0,
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_DELAYS_MS.length) {
        await wait(RETRY_DELAYS_MS[attempt]);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchContentWithRetry({ force: true }));
    } catch {
      setError("We could not load the latest site content. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchContentWithRetry()
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
