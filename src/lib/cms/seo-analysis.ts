/**
 * Pure, isomorphic SEO checklist for the post editor. No DOM APIs, no
 * `server-only` imports — this file runs both in the browser (live checklist
 * while typing) and on the server (if ever needed there). HTML is inspected
 * with regexes only; it is trusted editor output, not attacker-controlled
 * markup that needs a real parser.
 */

export type SeoCheckStatus = "pass" | "warn" | "fail";

export type SeoCheck = {
  id: string;
  label: string;
  status: SeoCheckStatus;
  detail: string;
};

export type SeoAnalysisInput = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  focusKeyword: string;
  html: string;
  coverImageUrl: string;
  coverImageAlt: string;
};

export type SeoAnalysis = {
  score: number;
  checks: SeoCheck[];
};

const stripTags = (html: string) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const wordCount = (html: string) => (stripTags(html).match(/[\p{L}\p{N}'-]+/gu) ?? []).length;

const includesCi = (haystack: string, needle: string) =>
  needle.trim().length > 0 && haystack.toLowerCase().includes(needle.trim().toLowerCase());

function firstParagraphText(html: string): string {
  const m = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return m ? stripTags(m[1]) : "";
}

function headingTexts(html: string, level: 2 | 3): string[] {
  const re = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(stripTags(m[1]));
  return out;
}

function images(html: string): { alt: string }[] {
  const re = /<img\b[^>]*>/gi;
  const out: { alt: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const altMatch = tag.match(/\balt=(?:"([^"]*)"|'([^']*)')/i);
    out.push({ alt: (altMatch?.[1] ?? altMatch?.[2] ?? "").trim() });
  }
  return out;
}

function hasInternalLink(html: string): boolean {
  const re = /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = (m[1] ?? m[2] ?? "").trim();
    if (href.startsWith("/") || href.toLowerCase().includes("jeevanproductions.com")) return true;
  }
  return false;
}

const rangeStatus = (value: number, min: number, max: number): SeoCheckStatus => {
  if (value === 0) return "fail";
  if (value < min || value > max) return "warn";
  return "pass";
};

/** Analyse a post draft against the CMS's fixed SEO checklist. Pure — safe on client or server. */
export function analyzeSeo(input: SeoAnalysisInput): SeoAnalysis {
  const title = input.title.trim();
  const slug = input.slug.trim();
  const metaTitle = input.metaTitle.trim() || title;
  const metaDescription = input.metaDescription.trim() || input.excerpt.trim();
  const keyword = input.focusKeyword.trim();
  const html = input.html ?? "";
  const words = wordCount(html);
  const imgs = images(html);
  const imagesWithoutAlt = imgs.filter((i) => !i.alt).length;

  const checks: SeoCheck[] = [];
  const push = (id: string, label: string, status: SeoCheckStatus, detail: string) =>
    checks.push({ id, label, status, detail });

  if (!keyword) {
    push("keyword-in-title", "Focus keyword in title", "warn", "Set a focus keyword to enable this check.");
    push("keyword-in-slug", "Focus keyword in slug", "warn", "Set a focus keyword to enable this check.");
    push(
      "keyword-in-meta-description",
      "Focus keyword in meta description",
      "warn",
      "Set a focus keyword to enable this check.",
    );
    push(
      "keyword-in-first-paragraph",
      "Focus keyword in the opening paragraph",
      "warn",
      "Set a focus keyword to enable this check.",
    );
    push("keyword-in-heading", "Focus keyword in a subheading", "warn", "Set a focus keyword to enable this check.");
  } else {
    push(
      "keyword-in-title",
      "Focus keyword in title",
      includesCi(title, keyword) ? "pass" : "fail",
      includesCi(title, keyword) ? "The title contains the focus keyword." : "Add the focus keyword to the title.",
    );
    push(
      "keyword-in-slug",
      "Focus keyword in slug",
      includesCi(slug.replace(/-/g, " "), keyword) ? "pass" : "warn",
      includesCi(slug.replace(/-/g, " "), keyword)
        ? "The slug contains the focus keyword."
        : "Consider working the focus keyword into the slug.",
    );
    push(
      "keyword-in-meta-description",
      "Focus keyword in meta description",
      includesCi(metaDescription, keyword) ? "pass" : "fail",
      includesCi(metaDescription, keyword)
        ? "The meta description contains the focus keyword."
        : "Add the focus keyword to the meta description.",
    );
    const firstPara = firstParagraphText(html);
    push(
      "keyword-in-first-paragraph",
      "Focus keyword in the opening paragraph",
      includesCi(firstPara, keyword) ? "pass" : "fail",
      includesCi(firstPara, keyword)
        ? "The opening paragraph contains the focus keyword."
        : "Mention the focus keyword in the first paragraph.",
    );
    const h2s = headingTexts(html, 2);
    const inHeading = h2s.some((h) => includesCi(h, keyword));
    push(
      "keyword-in-heading",
      "Focus keyword in a subheading",
      inHeading ? "pass" : "warn",
      inHeading ? "An H2 contains the focus keyword." : "Use the focus keyword in at least one H2.",
    );
  }

  push(
    "content-length",
    "Content length",
    words >= 300 ? "pass" : words >= 150 ? "warn" : "fail",
    `${words} word${words === 1 ? "" : "s"} — aim for at least 300.`,
  );

  push(
    "meta-title-length",
    "Meta title length",
    rangeStatus(metaTitle.length, 50, 60),
    metaTitle.length === 0
      ? "No title set."
      : `${metaTitle.length} characters — target 50–60.`,
  );

  push(
    "meta-description-length",
    "Meta description length",
    rangeStatus(metaDescription.length, 120, 160),
    metaDescription.length === 0
      ? "No meta description or excerpt set."
      : `${metaDescription.length} characters — target 120–160.`,
  );

  push(
    "image-alt",
    "Every image has alt text",
    imgs.length === 0 ? "warn" : imagesWithoutAlt === 0 ? "pass" : "fail",
    imgs.length === 0
      ? "No images in the body yet."
      : imagesWithoutAlt === 0
        ? `All ${imgs.length} image${imgs.length === 1 ? "" : "s"} have alt text.`
        : `${imagesWithoutAlt} of ${imgs.length} image${imgs.length === 1 ? "" : "s"} missing alt text.`,
  );

  const internalLink = hasInternalLink(html);
  push(
    "internal-link",
    "At least one internal link",
    internalLink ? "pass" : "warn",
    internalLink ? "The body links to another Jeevan Productions page." : "Link to another page on the site.",
  );

  push(
    "excerpt-present",
    "Excerpt present",
    input.excerpt.trim() ? "pass" : "fail",
    input.excerpt.trim() ? "An excerpt is set." : "Add a short excerpt.",
  );

  push(
    "cover-image-present",
    "Cover image present",
    input.coverImageUrl.trim() ? (input.coverImageAlt.trim() ? "pass" : "warn") : "fail",
    !input.coverImageUrl.trim()
      ? "No cover image set."
      : input.coverImageAlt.trim()
        ? "A cover image with alt text is set."
        : "Cover image is missing alt text.",
  );

  const weight: Record<SeoCheckStatus, number> = { pass: 1, warn: 0.5, fail: 0 };
  const score = Math.round((checks.reduce((sum, c) => sum + weight[c.status], 0) / checks.length) * 100);

  return { score, checks };
}
