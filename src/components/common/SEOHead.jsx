import { Helmet } from "react-helmet-async";

const BASE_URL = "https://grainmuse.net";

export default function SEOHead({ title, description, path = "/", image }) {
  const fullTitle = title
    ? `${title} | Grain Muse`
    : "Grain Muse – Craft Instant Fried Rice & Herbal Teas | Sri Lanka";
  const fullUrl = `${BASE_URL}${path}`;
  const ogImage = image || `${BASE_URL}/og-image.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
