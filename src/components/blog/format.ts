/** Shared date formatting for the public blog — no time-of-day, just a clean editorial date. */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );
}
