import { headers } from "next/headers";

/**
 * Shared server-side security helpers for every form on the site (careers
 * application, contact enquiry, and any future form). Nothing in this file
 * trusts client input — it exists specifically to re-check what the client
 * already validated, because the client can always be bypassed.
 */

// ---------------------------------------------------------------------------
// Shared action result shape
// ---------------------------------------------------------------------------

export type ActionResult = {
  status: "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// IP address resolution
// ---------------------------------------------------------------------------

/** Best-effort client IP from proxy headers. Never fully trustworthy, but
 * good enough for a soft rate limit and for passing to Turnstile siteverify. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/**
 * Simple in-memory fixed-window rate limit: N submissions per IP per window.
 *
 * PRODUCTION NOTE: this Map lives in a single Node process's memory. It resets
 * on every deploy/restart and is NOT shared across multiple server instances
 * or serverless invocations. That's fine for a small single-instance deploy,
 * but as soon as this app runs on more than one instance (or serverless,
 * where each invocation may get a cold process), this stops being an
 * effective limit. Move it to a shared store — Upstash Redis is the natural
 * fit for a Vercel deployment — keyed the same way (`ip` + route name).
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // 5 submissions per window per IP

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (bucket.count >= RATE_LIMIT_MAX) return false;

  bucket.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Cloudflare Turnstile
// ---------------------------------------------------------------------------

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Turnstile token server-side.
 *
 * Fail-open/closed policy (explicit, on purpose):
 * - `TURNSTILE_SECRET_KEY` set → always verify against Cloudflare. A missing
 *   or empty token, or a verification failure, rejects the submission.
 * - `TURNSTILE_SECRET_KEY` NOT set, `NODE_ENV === "production"` → FAIL CLOSED.
 *   Refusing to accept bot-protection-less submissions in production is the
 *   safer default; a misconfigured deploy should not silently accept spam.
 * - `TURNSTILE_SECRET_KEY` NOT set, any other environment (dev/test) → allow
 *   the submission through so the form is testable without Cloudflare
 *   credentials on a laptop. A console warning makes this impossible to miss.
 */
export async function verifyTurnstile(
  token: FormDataEntryValue | null,
  ip: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[form-security] TURNSTILE_SECRET_KEY is not set. Failing CLOSED in production — " +
          "no submissions will be accepted until the env var is configured (see .env.example).",
      );
      return {
        ok: false,
        reason: "This form is temporarily unavailable. Please try again shortly.",
      };
    }
    console.warn(
      "[form-security] TURNSTILE_SECRET_KEY is not set. Allowing this submission because " +
        "NODE_ENV is not 'production' (dev/test mode). Do not deploy without setting the key.",
    );
    return { ok: true };
  }

  if (!token || typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "Please complete the verification challenge and try again." };
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });

    if (!res.ok) {
      return { ok: false, reason: "Verification could not be completed. Please try again." };
    }

    const data = (await res.json()) as { success: boolean };
    if (!data.success) {
      return { ok: false, reason: "Verification failed. Please refresh the page and try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Verification could not be completed. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// File upload validation (resume, etc.)
// ---------------------------------------------------------------------------

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

type AllowedFileType = {
  mime: string;
  ext: string;
  /** Leading bytes ("magic numbers") that must open the file. */
  magic: number[];
};

/** Only these three document types are accepted anywhere resumes are uploaded. */
export const ALLOWED_RESUME_TYPES: AllowedFileType[] = [
  { mime: "application/pdf", ext: ".pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "application/msword", ext: ".doc", magic: [0xd0, 0xcf, 0x11, 0xe0] }, // legacy OLE
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: ".docx",
    magic: [0x50, 0x4b, 0x03, 0x04], // PK.. (zip container)
  },
];

/** Strips path components and any character outside a safe allowlist. Never
 * trust a browser-supplied filename for storage or display without this. */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  return cleaned.length > 0 ? cleaned : "resume";
}

export type ValidatedFile = {
  filename: string;
  mime: string;
  buffer: ArrayBuffer;
};

/**
 * Validates an uploaded resume against three independent checks — declared
 * MIME type, file extension, AND the file's actual leading bytes — and
 * rejects on any mismatch between them. A file claiming to be a PDF whose
 * bytes don't start with `%PDF` is rejected even if the browser's `type` and
 * the filename both say "pdf".
 */
export async function validateResumeFile(
  file: File | null,
): Promise<{ ok: true; file: ValidatedFile } | { ok: false; reason: string }> {
  if (!file || typeof file === "string" || file.size === 0) {
    return { ok: false, reason: "Attach your resume to continue." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: "Resume must be smaller than 5MB." };
  }

  const extMatch = /\.[a-zA-Z0-9]+$/.exec(file.name);
  const ext = extMatch ? extMatch[0]!.toLowerCase() : "";

  const byMime = ALLOWED_RESUME_TYPES.find((t) => t.mime === file.type);
  const byExt = ALLOWED_RESUME_TYPES.find((t) => t.ext === ext);

  if (!byMime || !byExt || byMime.ext !== byExt.ext) {
    return {
      ok: false,
      reason: "Resume must be a PDF or Word document (.pdf, .doc, or .docx).",
    };
  }

  const buffer = await file.arrayBuffer();
  const head = new Uint8Array(buffer.slice(0, 4));
  const magicMatches = byMime.magic.every((byte, i) => head[i] === byte);

  if (!magicMatches) {
    return {
      ok: false,
      reason: "That file doesn't look like a valid PDF or Word document.",
    };
  }

  return {
    ok: true,
    file: { filename: sanitizeFilename(file.name), mime: byMime.mime, buffer },
  };
}

// ---------------------------------------------------------------------------
// Webhook hand-off
// ---------------------------------------------------------------------------

/**
 * Posts a validated submission's metadata + optional file to a single
 * configured webhook URL. This is the ONLY place either form's `deliver*()`
 * function should talk to the outside world — see `src/app/careers/actions.ts`
 * (`deliverApplication`) and `src/app/contact/actions.ts` (`deliverEnquiry`).
 *
 * No storage provider is configured out of the box (no credentials are
 * committed to this repo). If `webhookUrl` is undefined, this throws a
 * descriptive error instead of silently discarding a real submission.
 */
export async function postToWebhook(
  webhookUrl: string | undefined,
  payload: Record<string, unknown>,
  file: ValidatedFile | undefined,
  contextLabel: string,
): Promise<void> {
  if (!webhookUrl) {
    throw new Error(
      `${contextLabel} delivery is not configured. Set the corresponding *_WEBHOOK_URL ` +
        `environment variable (see .env.example) to point at your storage/ATS/CRM/email ` +
        `provider, or replace the body of this function with a direct SDK call.`,
    );
  }

  const body = new FormData();
  body.set("payload", JSON.stringify(payload));
  if (file) {
    body.set("file", new Blob([file.buffer], { type: file.mime }), file.filename);
  }

  const res = await fetch(webhookUrl, { method: "POST", body });
  if (!res.ok) {
    throw new Error(`${contextLabel} webhook responded with HTTP ${res.status}.`);
  }
}
