"use server";

import { z } from "zod";
import { roleOptions } from "@/content/careers";
import {
  checkRateLimit,
  getClientIp,
  postToWebhook,
  validateResumeFile,
  verifyTurnstile,
  type ActionResult,
  type ValidatedFile,
} from "@/lib/form-security";

/**
 * Server Action backing the careers application form
 * (`src/components/careers/ApplicationForm.tsx`). Everything here re-validates
 * from scratch — the client-side validation only exists for a fast, friendly
 * UX, and is never trusted on its own.
 */

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^https?:\/\/.+/i.test(v), {
    message: "Enter a full URL starting with http:// or https://.",
  });

const applicationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "That name is too long."),
  email: z.email("Enter a valid email address.").max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  role: z
    .string()
    .refine((v) => roleOptions.includes(v), { message: "Select an area of interest." }),
  portfolioUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  personalWebsite: optionalUrl,
  aboutYou: z
    .string()
    .trim()
    .min(30, "Tell us a little more about yourself (at least 30 characters).")
    .max(4000, "Keep this under 4000 characters."),
  whyJeevan: z
    .string()
    .trim()
    .min(30, "Tell us a little more about why Jeevan Productions (at least 30 characters).")
    .max(4000, "Keep this under 4000 characters."),
  consent: z.literal("on", "You must agree before submitting."),
});

export async function submitApplication(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();

  if (!checkRateLimit(`careers:${ip}`)) {
    return {
      status: "error",
      message: "Too many submissions from this connection. Please try again in a few minutes.",
    };
  }

  const turnstileResult = await verifyTurnstile(formData.get("turnstileToken"), ip);
  if (!turnstileResult.ok) {
    return { status: "error", message: turnstileResult.reason };
  }

  const parsed = applicationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    role: formData.get("role"),
    portfolioUrl: formData.get("portfolioUrl"),
    linkedinUrl: formData.get("linkedinUrl"),
    personalWebsite: formData.get("personalWebsite"),
    aboutYou: formData.get("aboutYou"),
    whyJeevan: formData.get("whyJeevan"),
    consent: formData.get("consent"),
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

  const resumeEntry = formData.get("resume");
  const resumeFile = resumeEntry instanceof File ? resumeEntry : null;
  const resumeResult = await validateResumeFile(resumeFile);
  if (!resumeResult.ok) {
    return {
      status: "error",
      message: "There's a problem with your resume upload.",
      fieldErrors: { resume: resumeResult.reason },
    };
  }

  try {
    await deliverApplication(
      {
        ...parsed.data,
        submittedAt: new Date().toISOString(),
        sourceIp: ip,
      },
      resumeResult.file,
    );
  } catch (err) {
    console.error("[careers/actions] deliverApplication failed:", err);
    return {
      status: "error",
      message:
        "We couldn't submit your application right now. Please try again shortly, or email us directly.",
    };
  }

  return {
    status: "success",
    message: "Thank you — your application is in. We'll be in touch if there's a fit.",
  };
}

type ApplicationData = z.infer<typeof applicationSchema> & {
  submittedAt: string;
  sourceIp: string;
};

/**
 * SINGLE HAND-OFF POINT for delivering a validated application.
 *
 * No storage provider is wired up out of the box — this repo commits no
 * storage credentials. JP's developer: point `APPLICATION_WEBHOOK_URL` (see
 * `.env.example`) at whatever you use to receive applications (a Zapier/Make
 * webhook, an ATS's inbound endpoint, a serverless function that emails +
 * saves to S3/Airtable, etc.), or replace the body of this function with a
 * direct SDK call to your provider. Do this here ONLY — nothing else in the
 * app should reach out to an external service.
 */
async function deliverApplication(data: ApplicationData, resume: ValidatedFile): Promise<void> {
  await postToWebhook(process.env.APPLICATION_WEBHOOK_URL, data, resume, "Application");
}
