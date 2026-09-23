"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { NavItem } from "./nav-items";

/** One sidebar/top-bar link, active-highlighted via `usePathname`. */
export function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors",
        active ? "bg-ink text-paper" : "text-ink-3 hover:bg-ink/5 hover:text-ink",
      )}
    >
      {item.label}
    </Link>
  );
}
