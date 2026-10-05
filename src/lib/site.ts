/**
 * The public address of the website, used in links people share.
 * Set NEXT_PUBLIC_SITE_URL (for example https://ghuribangladesh.com) so shared links never show localhost.
 * Without it, the address the visitor is browsing is used.
 */
export function siteOrigin(): string {
  const set = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (set) return set;
  return typeof window === "undefined" ? "" : window.location.origin;
}
