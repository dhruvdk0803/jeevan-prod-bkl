/** URL-safe key for a static route path, for use as a dynamic segment (`/admin/seo/<key>`). */
export function routeKey(path: string): string {
  return path === "/" ? "home" : path.slice(1);
}

export function keyToPath(key: string): string {
  return key === "home" ? "/" : `/${key}`;
}
