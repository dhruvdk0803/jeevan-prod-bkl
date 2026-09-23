/**
 * The admin sidebar route map — see CMS-BRIEF.md "Admin route map &
 * ownership". Keep this list, and only this list, in that exact order.
 */
export type NavItem = {
  href: string;
  label: string;
  /** Restrict to this role; omit to show to every signed-in user. */
  role?: "admin";
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/redirects", label: "Redirects" },
  { href: "/admin/settings", label: "Settings", role: "admin" },
  { href: "/admin/users", label: "Users", role: "admin" },
  { href: "/admin/account", label: "Account" },
];
