import { ButtonLink } from "@/components/admin/ui";

/** 404 inside /admin — no site chrome, matches the admin visual language. */
export default function AdminNotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-16 text-center">
      <div>
        <p className="text-neutral text-sm font-medium tracking-wide uppercase">404</p>
        <h1 className="font-display text-ink mt-2 text-2xl tracking-[-0.02em]">Page not found</h1>
        <p className="text-neutral mt-2 max-w-[40ch] text-sm">
          That admin page doesn&rsquo;t exist, or you don&rsquo;t have access to it.
        </p>
        <div className="mt-6">
          <ButtonLink href="/admin" variant="primary">
            Back to dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
