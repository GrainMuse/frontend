import { useEffect, useState } from "react";
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
  const [loaded, setLoaded] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);

  useEffect(() => {
    setActiveSrc(src);
    setLoaded(false);
  }, [src]);

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
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallbackSrc && activeSrc !== fallbackSrc) {
            setActiveSrc(fallbackSrc);
            setLoaded(false);
          } else {
            setLoaded(true);
          }
        }}
      />
    </span>
  );
}
