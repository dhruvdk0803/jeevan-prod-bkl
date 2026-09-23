"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { submitEnquiry } from "@/app/(site)/contact/actions";
import type { ActionResult } from "@/lib/form-security";
import {
  FieldError,
  Fieldset,
  SelectField,
  TextArea,
  TextField,
} from "@/components/forms/FormField";
import { Turnstile } from "@/components/forms/Turnstile";

/**
 * The interactive contact form: a tactile "what are you interested in"
 * choice, shared fields, and a short set of fields specific to that choice.
 * Everything renders even without JS (native radios + a real submit button);
 * the only JS-dependent behaviour is which extra fields are visible.
 */

const interests = [
  { id: "MEDIA", label: "Media", blurb: "Photography, video, film." },
  { id: "MARKETING", label: "Marketing", blurb: "Brand strategy, campaigns." },
  { id: "EVENTS", label: "Events", blurb: "Planning, design, production." },
  { id: "PARTNERSHIPS", label: "Partnerships", blurb: "Working together long-term." },
  { id: "OTHER", label: "Other", blurb: "Something else in mind." },
] as const;

type Interest = (typeof interests)[number]["id"];

const timelineOptions = ["ASAP", "1–3 months", "3–6 months", "6+ months", "Not sure yet"];
const budgetOptions = [
  "Under $2,500",
  "$2,500–$10,000",
  "$10,000–$25,000",
  "$25,000+",
  "Prefer not to say",
];
const shootTypeOptions = ["Photography", "Videography", "Photography & videography"];
const marketingScopeOptions = ["Brand strategy", "Social media", "Campaign", "Content"];

const initialState: ActionResult = { status: "error", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="t-label inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-paper transition-colors duration-300 hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

function interestLabel(id: Interest | ""): string {
  return interests.find((i) => i.id === id)?.label ?? "";
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitEnquiry, initialState);
  const [interest, setInterest] = useState<Interest | "">("");
  const successRef = useRef<HTMLDivElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success" && successRef.current) {
      successRef.current.focus();
    } else if (state.status === "error" && state.message && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [state]);

  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const showErrorSummary = state.status === "error" && Boolean(state.message);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="rule border-t-0 bg-paper-warm px-8 py-14 text-center sm:px-16"
      >
        <p className="t-label mb-4 text-ember">Message received</p>
        <h3 className="t-h3">{state.message}</h3>
        <p className="t-body mx-auto mt-4 max-w-[48ch] text-ink-3">
          A real person reads every message. We typically reply within a couple of business days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-12">
      {showErrorSummary ? (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="border-l-2 border-ember-deep bg-sand px-6 py-5"
        >
          <p className="t-body text-ink">{state.message}</p>
        </div>
      ) : null}

      <Fieldset legend="What are you interested in?" required>
        <div
          role="radiogroup"
          aria-label="What are you interested in?"
          aria-describedby={fieldErrors.interest ? "field-interest-error" : undefined}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {interests.map((opt) => {
            const active = interest === opt.id;
            return (
              <label
                key={opt.id}
                className={clsx(
                  "min-h-11 cursor-pointer rounded-2xl border px-5 py-6 transition-colors duration-300",
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/50 text-ink hover:border-ink",
                )}
              >
                <input
                  type="radio"
                  name="interest"
                  value={opt.id}
                  required
                  checked={active}
                  onChange={() => setInterest(opt.id)}
                  className="sr-only"
                />
                <span className="t-label block">{opt.label}</span>
                <span
                  className={clsx(
                    "t-body mt-2 block",
                    active ? "text-paper/70" : "text-neutral",
                  )}
                >
                  {opt.blurb}
                </span>
              </label>
            );
          })}
        </div>
        <FieldError id="field-interest-error">{fieldErrors.interest}</FieldError>
      </Fieldset>

      <Fieldset legend="About you">
        <div className="grid gap-8 sm:grid-cols-2">
          <TextField name="name" label="Name" required autoComplete="name" error={fieldErrors.name} />
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />
          <TextField name="company" label="Company" autoComplete="organization" error={fieldErrors.company} />
          <TextField name="phone" label="Phone" type="tel" autoComplete="tel" error={fieldErrors.phone} />
        </div>
      </Fieldset>

      <Fieldset legend="Your project">
        <div className="grid gap-8 sm:grid-cols-2">
          <TextField
            key={interest}
            name="projectType"
            label="Project type"
            defaultValue={interestLabel(interest)}
            error={fieldErrors.projectType}
          />
          <SelectField
            name="timeline"
            label="Timeline"
            options={timelineOptions}
            error={fieldErrors.timeline}
          />
          <SelectField
            name="budget"
            label="Budget range (optional)"
            options={budgetOptions}
            placeholder="Prefer not to say"
            error={fieldErrors.budget}
          />
        </div>

        {interest === "MEDIA" ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <SelectField
              name="shootType"
              label="Shoot type"
              options={shootTypeOptions}
              error={fieldErrors.shootType}
            />
            <TextField name="shootLocation" label="Location" error={fieldErrors.shootLocation} />
          </div>
        ) : null}

        {interest === "EVENTS" ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <TextField name="eventDate" label="Event date" type="date" error={fieldErrors.eventDate} />
            <TextField
              name="guestCount"
              label="Guest count"
              type="number"
              min={1}
              inputMode="numeric"
              error={fieldErrors.guestCount}
            />
          </div>
        ) : null}

        {interest === "MARKETING" ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <SelectField
              name="marketingScope"
              label="Scope"
              options={marketingScopeOptions}
              error={fieldErrors.marketingScope}
            />
            <TextField
              name="marketingChannels"
              label="Channels"
              placeholder="Instagram, email, print…"
              error={fieldErrors.marketingChannels}
            />
          </div>
        ) : null}

        {interest === "PARTNERSHIPS" ? (
          <div className="mt-8">
            <TextField
              name="partnershipType"
              label="What kind of partnership are you imagining?"
              error={fieldErrors.partnershipType}
            />
          </div>
        ) : null}

        <TextArea
          name="details"
          label="Tell us about your project"
          required
          rows={5}
          className="mt-8"
          error={fieldErrors.details}
        />
      </Fieldset>

      <Turnstile />

      <SubmitButton />
    </form>
  );
}
