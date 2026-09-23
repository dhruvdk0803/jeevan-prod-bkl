import { getFeedPosts, getSiteSettings } from "@/lib/cms/public";
import { site } from "@/content/site";

export const revalidate = 300;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/**
 * RSS 2.0 feed for the blog, with `content:encoded` full-post HTML and an
 * Atom self-link. All URLs are absolute, as RSS requires.
 */
export async function GET() {
  const [posts, settings] = await Promise.all([getFeedPosts(30), getSiteSettings()]);

  const title = settings.blogTitle || "The Journal";
  const description = settings.blogIntro || `Notes, stories and guides from ${site.name}.`;
  const feedUrl = `${site.url}/blog/feed.xml`;
  const lastBuildDate = posts[0]?.updatedAt ?? new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`;
      const categoryXml = post.category ? `\n      <category>${esc(post.category.name)}</category>` : "";
      return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>${categoryXml}
      ${post.author ? `<dc:creator>${esc(post.author.name)}</dc:creator>` : ""}
      <description>${cdata(post.excerpt || "")}</description>
      <content:encoded>${cdata(post.content)}</content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(title)} — ${esc(site.name)}</title>
    <link>${site.url}/blog</link>
    <description>${esc(description)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
