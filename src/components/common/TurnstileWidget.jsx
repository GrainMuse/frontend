import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const SCRIPT_ID = "grainmuse-turnstile-script";
const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing ?? document.createElement("script");

    const handleLoad = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile API did not initialize."));
    };
    const handleError = () => reject(new Error("Turnstile script failed to load."));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = undefined;
    document.getElementById(SCRIPT_ID)?.remove();
    throw error;
  });

  return scriptPromise;
}

const TurnstileWidget = forwardRef(function TurnstileWidget(
  { siteKey, onVerify, onExpire, onError },
  ref,
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError };
  }, [onVerify, onExpire, onError]);

  useImperativeHandle(ref, () => ({
    reset() {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }), []);

  useEffect(() => {
    let cancelled = false;
    let api;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        api = turnstile;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: "contact",
          appearance: "always",
          execution: "render",
          size: "flexible",
          theme: "auto",
          "response-field": false,
          callback: (token) => callbacksRef.current.onVerify(token),
          "expired-callback": () => callbacksRef.current.onExpire(),
          "timeout-callback": () => callbacksRef.current.onExpire(),
          "error-callback": () => {
            callbacksRef.current.onError();
            return true;
          },
          "unsupported-callback": () => callbacksRef.current.onError(),
        });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          callbacksRef.current.onError();
        }
      });

    return () => {
      cancelled = true;
      if (api && widgetIdRef.current !== null) {
        api.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div aria-label="Security verification">
      {loading && <span role="status">Loading security check…</span>}
      <div ref={containerRef} />
    </div>
  );
});

export default TurnstileWidget;
