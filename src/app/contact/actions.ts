"use server";

import { z } from "zod";
import {
  checkRateLimit,
  getClientIp,
  postToWebhook,
  verifyTurnstile,
  type ActionResult,
} from "@/lib/form-security";

/**
 * Server Action backing `src/components/contact/ContactForm.tsx`. Mirrors the
 * careers action's security pattern (rate limit → Turnstile → zod → deliver)
 * via the shared helpers in `src/lib/form-security.ts`.
 */

const interestValues = ["MEDIA", "MARKETING", "EVENTS", "PARTNERSHIPS", "OTHER"] as const;

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

  const parsed = enquirySchema.safeParse({
    interest: formData.get("interest"),
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    projectType: formData.get("projectType"),
    timeline: formData.get("timeline"),
    budget: formData.get("budget"),
    details: formData.get("details"),
    shootType: formData.get("shootType"),
    shootLocation: formData.get("shootLocation"),
    eventDate: formData.get("eventDate"),
    guestCount: formData.get("guestCount"),
    marketingScope: formData.get("marketingScope"),
    marketingChannels: formData.get("marketingChannels"),
    partnershipType: formData.get("partnershipType"),
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
    await deliverEnquiry({
      ...parsed.data,
      submittedAt: new Date().toISOString(),
      sourceIp: ip,
    });
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
    message: "Thank you — your message is in. We'll be in touch soon.",
  };
}

type EnquiryData = z.infer<typeof enquirySchema> & {
  submittedAt: string;
  sourceIp: string;
};

/**
 * SINGLE HAND-OFF POINT for delivering a validated enquiry.
 *
 * No storage/CRM provider is wired up out of the box — this repo commits no
 * credentials. JP's developer: point `ENQUIRY_WEBHOOK_URL` (see
 * `.env.example`) at whatever receives new enquiries (a CRM's inbound
 * webhook, a Zapier/Make automation, an email-sending function, etc.), or
 * replace the body of this function with a direct SDK call. Do this here
 * ONLY — nothing else in the app should reach out to an external service.
 */
async function deliverEnquiry(data: EnquiryData): Promise<void> {
  await postToWebhook(process.env.ENQUIRY_WEBHOOK_URL, data, undefined, "Enquiry");
}
