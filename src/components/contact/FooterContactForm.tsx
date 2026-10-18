"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { submitEnquiry } from "@/app/(site)/contact/actions";
import type { ActionResult } from "@/lib/form-security";
import { Turnstile } from "@/components/forms/Turnstile";

/**
 * Compact enquiry form for the dark footer. Posts to the same server action
 * as the full contact form (rate limit → Turnstile → zod → webhook), so it
 * sends just a name, email, interest and message. Hidden on /contact, where
 * the full form already is.
 */

const interests = [
  { id: "MEDIA", label: "Media" },
  { id: "MARKETING", label: "Marketing" },
  { id: "EVENTS", label: "Events" },
  { id: "PARTNERSHIPS", label: "Partnerships" },
  { id: "OTHER", label: "Other" },
] as const;

const initialState: ActionResult = { status: "error", message: "" };

const inputClass =
  "t-body w-full rounded-none border-0 border-b border-paper/30 bg-transparent px-0 py-3 text-paper placeholder:text-paper/40 transition-colors duration-300 focus:border-paper focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="t-label inline-flex min-h-11 items-center justify-center rounded-full bg-ember px-8 py-4 text-paper transition-colors duration-300 hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="t-label block text-paper/50">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="t-body mt-2 text-ember-light">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FooterContactForm() {
  const pathname = usePathname();
  const [state, formAction] = useActionState(submitEnquiry, initialState);
  const uid = useId();

  if (pathname.startsWith("/contact")) return null;

  if (state.status === "success") {
    return (
      <div role="status" className="py-6">
        <p className="t-label mb-3 text-ember-light">Message received</p>
        <p className="t-h3">{state.message}</p>
      </div>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    interest: `${uid}-interest`,
    details: `${uid}-details`,
  };
  const describe = (key: keyof typeof ids) => (errors[key] ? `${ids[key]}-error` : undefined);

  return (
    <form action={formAction} noValidate className="space-y-8">
      {state.status === "error" && state.message ? (
        <p role="alert" className="t-body border-l-2 border-ember-light pl-4 text-paper/85">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id={ids.name} label="Name" error={errors.name}>
          <input
            id={ids.name}
            name="name"
            required
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
            className={inputClass}
          />
        </Field>
        <Field id={ids.email} label="Email" error={errors.email}>
          <input
            id={ids.email}
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe("email")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id={ids.interest} label="Interested in" error={errors.interest}>
        <select
          id={ids.interest}
          name="interest"
          required
          defaultValue=""
          aria-invalid={Boolean(errors.interest)}
          aria-describedby={describe("interest")}
          className={clsx(inputClass, "cursor-pointer [&>option]:text-ink")}
        >
          <option value="" disabled>
            Choose one
          </option>
          {interests.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id={ids.details} label="Tell us about your project" error={errors.details}>
        <textarea
          id={ids.details}
          name="details"
          required
          rows={4}
          aria-invalid={Boolean(errors.details)}
          aria-describedby={describe("details")}
          className={clsx(inputClass, "resize-y")}
        />
      </Field>

      <Turnstile />

      <SubmitButton />
    </form>
  );
}
