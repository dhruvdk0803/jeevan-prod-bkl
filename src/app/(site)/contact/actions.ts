"use server";

import { z } from "zod";
import {
  checkRateLimit,
  getClientIp,
  verifyTurnstile,
  type ActionResult,
} from "@/lib/form-security";
import { HONEYPOT_FIELD } from "@/components/forms/Honeypot";

/**
 * Server Action backing both enquiry forms (`ContactForm` and the footer's
 * `FooterContactForm`). Honeypot → rate limit → Turnstile → zod → Formspree,
 * via the shared helpers in `src/lib/form-security.ts`.
 */

const interestValues = ["MEDIA", "MARKETING", "EVENTS", "PARTNERSHIPS", "OTHER"] as const;

const interestLabels: Record<(typeof interestValues)[number], string> = {
  MEDIA: "Media",
  MARKETING: "Marketing",
  EVENTS: "Events",
  PARTNERSHIPS: "Partnerships",
  OTHER: "Other",
};

/** Where enquiries land. `ENQUIRY_FORMSPREE_URL` overrides it per environment. */
const FORMSPREE_ENDPOINT =
  process.env.ENQUIRY_FORMSPREE_URL || "https://formspree.io/f/xkgknllg";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const enquirySchema = z.object({
  interest: z.enum(interestValues, "Select what you're interested in."),
  name: z.string().trim().min(2, "Enter your name.").max(120, "That name is too long."),
  email: z.email("Enter a valid email address.").max(200),
  company: optionalText(160),
  phone: optionalText(30),
  projectType: optionalText(160),
  timeline: optionalText(60),
  budget: optionalText(60),
  details: z
    .string()
    .trim()
    .min(20, "Tell us a little more about your project (at least 20 characters).")
    .max(4000, "Keep this under 4000 characters."),
  // Variant-specific fields — each optional; only the fields relevant to the
  // selected `interest` are shown client-side, but all are accepted loosely
  // here since a client-side interest mismatch shouldn't hard-fail a
  // genuine enquiry.
  shootType: optionalText(60),
  shootLocation: optionalText(160),
  eventDate: optionalText(30),
  guestCount: optionalText(20),
  marketingScope: optionalText(60),
  marketingChannels: optionalText(200),
  partnershipType: optionalText(200),
});

export async function submitEnquiry(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();

  // A person never sees the honeypot field, so anything in it is a bot. Report
  // success so the bot has nothing to learn, and send nothing.
  if (String(formData.get(HONEYPOT_FIELD) ?? "").trim()) {
    return { status: "success", message: "Thank you. Your message is in, and we'll be in touch soon." };
  }

  if (!checkRateLimit(`contact:${ip}`)) {
    return {
      status: "error",
      message: "Too many submissions from this connection. Please try again in a few minutes.",
    };
  }

  const turnstileResult = await verifyTurnstile(formData.get("turnstileToken"), ip);
  if (!turnstileResult.ok) {
    return { status: "error", message: turnstileResult.reason };
  }

  // Fields a form doesn't render (the footer form, or variant fields hidden for
  // the chosen interest) come back as null; treat them as simply not provided.
  const field = (key: string) => formData.get(key) ?? undefined;

  const parsed = enquirySchema.safeParse({
    interest: field("interest"),
    name: field("name"),
    email: field("email"),
    company: field("company"),
    phone: field("phone"),
    projectType: field("projectType"),
    timeline: field("timeline"),
    budget: field("budget"),
    details: field("details"),
    shootType: field("shootType"),
    shootLocation: field("shootLocation"),
    eventDate: field("eventDate"),
    guestCount: field("guestCount"),
    marketingScope: field("marketingScope"),
    marketingChannels: field("marketingChannels"),
    partnershipType: field("partnershipType"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    await deliverEnquiry(parsed.data);
  } catch (err) {
    console.error("[contact/actions] deliverEnquiry failed:", err);
    return {
      status: "error",
      message:
        "We couldn't send your message right now. Please try again shortly, or email us directly.",
    };
  }

  return {
    status: "success",
    message: "Thank you. Your message is in, and we'll be in touch soon.",
  };
}

type EnquiryData = z.infer<typeof enquirySchema>;

/** Readable labels for the Formspree email, in the order they should appear. */
const fieldLabels: [keyof EnquiryData, string][] = [
  ["name", "Name"],
  ["phone", "Phone"],
  ["company", "Company"],
  ["projectType", "Project type"],
  ["timeline", "Timeline"],
  ["budget", "Budget"],
  ["shootType", "Shoot type"],
  ["shootLocation", "Shoot location"],
  ["eventDate", "Event date"],
  ["guestCount", "Guest count"],
  ["marketingScope", "Marketing scope"],
  ["marketingChannels", "Marketing channels"],
  ["partnershipType", "Partnership type"],
  ["details", "Message"],
];

/**
 * SINGLE HAND-OFF POINT for delivering a validated enquiry: posts it to
 * Formspree, which emails it to the team. `email` keeps its own key so
 * Formspree sets it as the reply-to address; blank optional fields are left
 * out so the email only shows what the person actually filled in.
 */
async function deliverEnquiry(data: EnquiryData): Promise<void> {
  const interest = interestLabels[data.interest];
  const body: Record<string, string> = {
    _subject: `New ${interest.toLowerCase()} enquiry from ${data.name}`,
    email: data.email,
    "Interested in": interest,
  };
  for (const [key, label] of fieldLabels) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) body[label] = value;
  }

  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Formspree responded with HTTP ${res.status}: ${await res.text()}`);
  }
}
