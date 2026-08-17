import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs({ items, inverse = false, className = "" }) {
  return (
    <nav
      className={`${styles.breadcrumbs} ${inverse ? styles.inverse : ""} ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 && <ChevronRight aria-hidden="true" />}
              {current || !item.to ? (
                <span aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
