import { useState } from "react";
import styles from "./ProgressiveImage.module.css";

export default function ProgressiveImage({
  src,
  alt,
  className = "",
  frameClassName = "",
  style,
  eager = false,
  fallbackSrc = null,
}) {
  const [loadedSource, setLoadedSource] = useState(null);
  const [failedSource, setFailedSource] = useState(null);
  const useFallback =
    Boolean(fallbackSrc) && fallbackSrc !== src && failedSource === src;
  const activeSrc = useFallback ? fallbackSrc : src;
  const loaded = !activeSrc || loadedSource === activeSrc;

  return (
    <span className={`${styles.frame} ${frameClassName}`}>
      {!loaded && <span className={styles.skeleton} aria-hidden="true" />}
      <img
        src={activeSrc}
        alt={alt}
        className={`${className} ${styles.image} ${loaded ? styles.loaded : ""}`}
        style={style}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoadedSource(activeSrc)}
        onError={() => {
          if (fallbackSrc && activeSrc === src && fallbackSrc !== src) {
            setFailedSource(src);
            setLoadedSource(null);
          } else {
            setLoadedSource(activeSrc);
          }
        }}
      />
    </span>
  );
}
