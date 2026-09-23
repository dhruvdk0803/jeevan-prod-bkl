/**
 * `npm run admin:create` — creates or promotes an admin user.
 *
 * Accepts `--email --name --password` flags; falls back to interactive
 * prompts for anything missing. If the email already exists, updates its
 * password and sets its role to admin (handy for resetting a locked-out
 * account) rather than failing.
 *
 * Runs migrations first via `scripts/db.ts`'s `openDb()`, same as
 * `db:migrate`. Do NOT run this while `next dev` is up against the local
 * PGlite database — PGlite is single-process and the two would collide.
 */
import { createInterface } from "node:readline/promises";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/lib/auth/password";
import { openDb } from "./db";

function parseArgs(argv: string[]) {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i++;
    } else {
      out[key] = "true";
    }
  }
  return out;
}

async function prompt(rl: ReturnType<typeof createInterface>, question: string, required = true): Promise<string> {
  for (;;) {
    const answer = (await rl.question(question)).trim();
    if (answer || !required) return answer;
    console.log("This is required.");
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    let email = args.email?.trim().toLowerCase();
    let name = args.name?.trim();
    let password = args.password;

    if (!email) email = (await prompt(rl, "Admin email: ")).toLowerCase();
    if (!name) name = await prompt(rl, "Admin name: ");
    if (!password) {
      password = await prompt(rl, `Password (min ${PASSWORD_MIN_LENGTH} chars): `);
    }

    if (!email.includes("@")) {
      console.error("That doesn't look like a valid email address.");
      process.exitCode = 1;
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      console.error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      process.exitCode = 1;
      return;
    }

    const { db, migrate, close } = await openDb();
    try {
      await migrate();

      const passwordHash = await hashPassword(password);
      const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);

      if (existing) {
        await db
          .update(schema.users)
          .set({ name, role: "admin", passwordHash, updatedAt: new Date() })
          .where(eq(schema.users.id, existing.id));
        console.log(`Updated existing user ${email} — password reset and role set to admin.`);
      } else {
        await db.insert(schema.users).values({ email, name, role: "admin", passwordHash });
        console.log(`Created admin user ${email}.`);
      }
    } finally {
      await close();
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
