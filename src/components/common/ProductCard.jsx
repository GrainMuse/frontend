import styles from "./ProductCard.module.css";
import { getProductImage } from "../../images/imageRegistry";
import ProgressiveImage from "../ui/ProgressiveImage";

export default function ProductCard({
  product,
  dark = false,
  index = 0,
  showNumber = true,
}) {
  const { slug, name, subtitle, desc, tags = [], badge, color, imagePath } = product;

  return (
    <article
      className={`${styles.card} ${dark ? styles.cardDark : styles.cardLight} sr`}
      style={{ "--accent": color, transitionDelay: `${index * 0.1}s` }}
    >
      {badge && <span className={styles.badge}>{badge}</span>}
      {showNumber && <span className={styles.cardNum}>0{index + 1}</span>}

      {/* <div className={styles.icon}>{icon}</div> */}
      <div className={styles.imgWrap}>
        <ProductImage
          path={imagePath || slug}
          fallbackSlug={slug}
          alt={product.name}
        />
      </div>
      <p className={styles.category}>{subtitle}</p>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.desc}>{desc}</p>

      <div className={styles.tags}>
        {tags.map((t) => (
          <span key={t} className={`tag ${dark ? "tag-dark" : ""}`}>
            {t}
          </span>
        ))}
      </div>

      <div className={styles.accentBar} />
    </article>
  );
}

function ProductImage({ path, fallbackSlug, alt }) {
  const imgUrl = getProductImage(path);
  const altText = alt || "Product image";

  return (
    <ProgressiveImage
      src={imgUrl}
      fallbackSrc={getProductImage(fallbackSlug)}
      alt={altText}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        objectFit: "cover",
        display: "block",
        borderRadius: "12px",
      }}
    />
  );
}
