"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/admin/ui";

/** Error boundary for /admin — no site chrome, matches the admin visual language. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-16 text-center">
      <div>
        <p className="text-ember text-sm font-medium tracking-wide uppercase">Something went wrong</p>
        <h1 className="font-display text-ink mt-2 text-2xl tracking-[-0.02em]">This page hit an error</h1>
        <p className="text-neutral mt-2 max-w-[44ch] text-sm">
          Try again, or head back to the dashboard. If this keeps happening, check the server logs.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <ButtonLink href="/admin" variant="secondary">
            Dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
