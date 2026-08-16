import { Helmet } from "react-helmet-async";

const BASE_URL = "https://grainmuse.net";

export default function SEOHead({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noIndex = false,
  structuredData,
}) {
  const fullTitle = title
    ? `${title} | Grain Muse`
    : "Grain Muse – Craft Instant Fried Rice & Herbal Teas | Sri Lanka";
  const fullUrl = `${BASE_URL}${path}`;
  const ogImage = image
    ? image.startsWith("http") ? image : `${BASE_URL}${image}`
    : `${BASE_URL}/og-image.png`;
  const schemas = (Array.isArray(structuredData) ? structuredData : [structuredData])
    .filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {schemas.map((schema, index) => (
        <script type="application/ld+json" key={`${schema["@type"] || "schema"}-${index}`}>
          {JSON.stringify(schema).replace(/</g, "\\u003c")}
        </script>
      ))}
    </Helmet>
  );
}
