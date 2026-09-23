import { site } from "@/content/site";

/**
 * Share links — plain `https://` share-intent URLs, no embedded widgets or
 * third-party scripts (those tend to ship trackers and layout shift).
 */
export function ShareLinks({
  path,
  title,
  className,
}: {
  path: string;
  title: string;
  className?: string;
}) {
  const url = `${site.url}${path}`;
  const links = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "Share by email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className={className}>
      <p className="t-label text-neutral mb-4">Share</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={l.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="t-label text-ink-3 hover:text-ember min-h-11 inline-flex items-center transition-colors duration-300"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
