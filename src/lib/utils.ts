/** Resolves thumbnail URL for deployment (handles base path for gh-pages). */
export function resolveThumbnail(thumbnail: string | undefined): string {
  if (!thumbnail) return "";
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  const base = import.meta.env.BASE_URL;
  return base + thumbnail;
}
