import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { count } from "drizzle-orm";
import { getDb, schema, isDatabaseConfigured } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Alert, Card } from "@/components/admin/ui";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

/** Only ever redirect somewhere inside /admin — never off-site, never "//". */
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/admin") && !next.startsWith("//")) return next;
  return "/admin";
}

function Wordmark() {
  return (
    <span className="font-display text-ink text-[1.4rem] leading-none tracking-[-0.02em]">
      Jeevan Productions<span className="text-ember">.</span>
    </span>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeNext(next);

  const user = await getCurrentUser();
  if (user) redirect("/admin");

  if (!isDatabaseConfigured()) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Wordmark />
          </div>
          <Card title="Database not configured">
            <Alert tone="warning">
              Set <code className="font-mono text-[0.85em]">DATABASE_URL</code> (see{" "}
              <code className="font-mono text-[0.85em]">.env.example</code>) to a Postgres
              connection string, or run this app with <code className="font-mono text-[0.85em]">
                next dev
              </code>{" "}
              to use the local embedded database automatically. The admin can&rsquo;t sign in
              until a database is reachable.
            </Alert>
          </Card>
        </div>
      </main>
    );
  }

  let userCount = 0;
  try {
    const db = await getDb();
    const [row] = await db.select({ n: count() }).from(schema.users);
    userCount = row?.n ?? 0;
  } catch {
    /* database briefly unreachable — the login form below will surface the real error */
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Wordmark />
        </div>
        <Card title="Sign in" description="Access the Jeevan Productions admin.">
          {userCount === 0 ? (
            <Alert tone="info" title="No admin account yet" >
              Set <code className="font-mono text-[0.85em]">ADMIN_EMAIL</code> and{" "}
              <code className="font-mono text-[0.85em]">ADMIN_PASSWORD</code> in your environment
              and sign in with those credentials once to create the first admin — or run{" "}
              <code className="font-mono text-[0.85em]">npm run admin:create</code> from a
              terminal.
            </Alert>
          ) : null}
          <div className={userCount === 0 ? "mt-4" : undefined}>
            <LoginForm next={nextPath} />
          </div>
        </Card>
      </div>
    </main>
  );
}
