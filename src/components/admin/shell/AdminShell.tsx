"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import type { SessionUser } from "@/lib/auth/session";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./NavLink";
import { signOut } from "./actions";

/**
 * Authenticated admin shell: a fixed left sidebar at `md`+, collapsing to a
 * top bar with a disclosure menu below it. One component so the nav item
 * list, role filtering and active state are defined exactly once.
 */
export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = NAV_ITEMS.filter((i) => !i.role || i.role === user.role);

  return (
    <div className="md:flex md:min-h-svh">
      {/* Desktop sidebar */}
      <aside className="border-ink/10 hidden w-60 shrink-0 flex-col border-r bg-white md:flex">
        <SidebarContent user={user} items={items} />
      </aside>

      {/* Mobile top bar + disclosure */}
      <div className="border-ink/10 flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="font-display text-ink text-[1.05rem] leading-none tracking-[-0.02em]">
          Jeevan Productions<span className="text-ember">.</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="jp-admin-menu"
          className="border-ink/15 flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium"
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true">{menuOpen ? "Close" : "Menu"}</span>
        </button>
      </div>
      {menuOpen ? (
        <div id="jp-admin-menu" className="border-ink/10 border-b bg-white md:hidden">
          <SidebarContent user={user} items={items} onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}

      <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({
  user,
  items,
  onNavigate,
}: {
  user: SessionUser;
  items: typeof NAV_ITEMS;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="font-display text-ink hidden px-1 text-[1.1rem] leading-none tracking-[-0.02em] md:block"
      >
        Jeevan Productions<span className="text-ember">.</span>
      </Link>

      <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-3 hover:bg-ink/5 hover:text-ink mt-2 flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors"
        >
          View site <span aria-hidden="true">↗</span>
        </a>
      </nav>

      <div className="border-ink/10 flex items-center justify-between gap-2 border-t pt-4">
        <div className="min-w-0">
          <p className="text-ink truncate text-sm font-medium">{user.name}</p>
          <p className="text-neutral truncate text-[0.75rem] capitalize">{user.role}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className={clsx(
              "text-ink-3 hover:bg-ink/5 hover:text-ember h-9 shrink-0 rounded-lg px-3 text-[0.8rem] font-medium transition-colors",
            )}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
