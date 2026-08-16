import { useEffect, useState } from "react";
import styles from "./ProgressiveImage.module.css";

export default function ProgressiveImage({
  src,
  alt,
  className = "",
  frameClassName = "",
  style,
  eager = false,
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(false), [src]);

  return (
    <span className={`${styles.frame} ${frameClassName}`}>
      {!loaded && <span className={styles.skeleton} aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        className={`${className} ${styles.image} ${loaded ? styles.loaded : ""}`}
        style={style}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </span>
  );
}
