import "server-only";
import sanitize from "sanitize-html";

/**
 * Server-side HTML sanitiser for post bodies. Runs on every save — the public
 * site renders `posts.content` with dangerouslySetInnerHTML, so this allowlist
 * is the XSS boundary. Keep it tight.
 */
export function sanitizePostHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "code", "pre",
      "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      // h1 is reserved for the post title.
      h1: "h2",
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : { ...attribs, target: "", rel: "" },
        };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "a" && !frame.attribs.href,
  }).replace(/ (target|rel)=""/g, "");
}

/** Plain text from HTML — for reading time, excerpts and SEO analysis. */
export function htmlToText(html: string): string {
  return sanitize(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** ~225 wpm, minimum one minute. */
export function readingMinutes(html: string): number {
  const words = htmlToText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

/**
 * Adds stable `id`s to h2/h3 (for the table of contents and deep links) and
 * returns the outline. Run on the sanitised HTML at render time.
 */
export function withHeadingIds(html: string): {
  html: string;
  toc: { id: string; text: string; level: 2 | 3 }[];
} {
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const used = new Map<string, number>();
  const out = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, _attrs, inner: string) => {
    const text = htmlToText(inner);
    const base =
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64) || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    toc.push({ id, text, level: Number(lvl) as 2 | 3 });
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}
