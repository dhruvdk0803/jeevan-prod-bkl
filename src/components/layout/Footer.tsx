import Link from "next/link";
import { footerNav, legalNav, site } from "@/content/site";
import { Arrow } from "@/components/primitives/Actions";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark bg-ink text-paper" data-theme-dark>
      <div className="gutter mx-auto max-w-[110rem] pt-[clamp(4rem,9vw,7.5rem)] pb-12">
        {/* Closing statement — the last thing anyone reads. */}
        <div className="rule border-t-0 pb-[clamp(3rem,7vw,6rem)]">
          <h2 className="t-statement max-w-[16ch]" data-reveal="mask">
            <span className="line-mask">
              <span>Let&rsquo;s create</span>
            </span>
            <span className="line-mask">
              <span>something meaningful.</span>
            </span>
          </h2>

          <Link
            href="/contact"
            className="group mt-10 inline-flex min-h-11 items-center gap-4 rounded-full bg-paper px-8 py-4 text-ink transition-colors duration-300 hover:bg-ember hover:text-paper"
          >
            <span className="t-label">Start a project</span>
            <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="rule grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="t-label mb-5 text-paper/50">Navigate</p>
            <ul className="space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="t-body text-paper/75 transition-colors duration-300 hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="t-label mb-5 text-paper/50">Contact</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="t-body break-words text-paper/75 transition-colors duration-300 hover:text-paper"
                >
                  {site.email}
                </a>
              </li>
              {site.phones.map((p) => (
                <li key={p.tel} className="t-body text-paper/75">
                  <span className="text-paper/50">{p.label}</span>{" "}
                  <a
                    href={`tel:${p.tel}`}
                    className="transition-colors duration-300 hover:text-paper"
                  >
                    {p.number}
                  </a>
                </li>
              ))}
              <li className="t-body text-paper/50">{site.hours}</li>
            </ul>
          </div>

          <div>
            <p className="t-label mb-5 text-paper/50">Location</p>
            <p className="t-body text-paper/75">
              {site.city}, {site.region}
            </p>
            <p className="t-body mt-1 text-paper/50">
              Working across {site.markets.join(" & ")}
            </p>
          </div>

          <div>
            <p className="t-label mb-5 text-paper/50">Follow</p>
            <ul className="space-y-2.5">
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group t-body inline-flex items-center gap-2 text-paper/75 transition-colors duration-300 hover:text-paper"
                  >
                    {s.label}
                    <Arrow className="-rotate-45 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rule mt-12 flex flex-col gap-4 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label text-paper/50">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="t-label text-paper/50 transition-colors duration-300 hover:text-paper/70"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
