const baseUrl = () => {
  const raw = import.meta.env.BASE_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
};

export function getProductImageFilename(article: string): string {
  return `${article.trim()}.png`;
}

export function getProductImagePath(article: string): string | null {
  const cleanArticle = article.trim();
  if (!cleanArticle) return null;
  return `${baseUrl()}images/${encodeURIComponent(getProductImageFilename(cleanArticle))}`;
}
