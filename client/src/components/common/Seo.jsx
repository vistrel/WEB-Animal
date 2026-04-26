import { useEffect } from "react";

const defaultTitle = "PetUA — платформа для вибору та продажу домашніх тварин";
const defaultDescription =
  "PetUA — веб-платформа для пошуку, вибору, розміщення оголошень і комунікації між продавцями та покупцями домашніх тварин.";

function setMeta(name, content, attribute = "name") {
  if (!content) {
    return;
  }

  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function Seo({
  title = defaultTitle,
  description = defaultDescription,
  path = "/",
}) {
  useEffect(() => {
    const fullTitle = title.includes("PetUA") ? title : `${title} — PetUA`;
    const canonicalUrl = `${window.location.origin}${path}`;

    document.documentElement.lang = "uk";
    document.title = fullTitle;

    setMeta("description", description);
    setMeta("robots", "index, follow");
    setMeta("theme-color", "#f08b57");

    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:site_name", "PetUA", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    let canonical = document.head.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);
  }, [title, description, path]);

  return null;
}

export default Seo;
