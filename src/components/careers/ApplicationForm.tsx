"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitApplication } from "@/app/(site)/careers/actions";
import type { ActionResult } from "@/lib/form-security";
import { roleOptions } from "@/content/careers";
import {
  CheckboxField,
  Fieldset,
  SelectField,
  TextArea,
  TextField,
  UploadField,
} from "@/components/forms/FormField";
import { Turnstile } from "@/components/forms/Turnstile";

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
      {pending ? "Submitting…" : "Submit application"}
    </button>
  );
}

export function ApplicationForm() {
  const [state, formAction] = useActionState(submitApplication, initialState);
  const formRef = useRef<HTMLFormElement>(null);
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
        <p className="t-label mb-4 text-ember">Application received</p>
        <h3 className="t-h3">{state.message}</h3>
        <p className="t-body mt-4 max-w-[48ch] mx-auto text-ink-3">
          We read every application personally. If your background is a fit for what&rsquo;s ahead,
          we&rsquo;ll reach out.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-12">
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

      <Fieldset legend="About you">
        <div className="grid gap-8 sm:grid-cols-2">
          <TextField
            name="fullName"
            label="Full name"
            required
            autoComplete="name"
            error={fieldErrors.fullName}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />
          <TextField
            name="phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            error={fieldErrors.phone}
          />
          <TextField
            name="location"
            label="Location"
            autoComplete="address-level2"
            placeholder="City, State"
            error={fieldErrors.location}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Your craft">
        <div className="grid gap-8 sm:grid-cols-2">
          <SelectField
            name="role"
            label="Role / area of interest"
            required
            options={roleOptions}
            error={fieldErrors.role}
            className="sm:col-span-2"
          />
          <TextField
            name="portfolioUrl"
            label="Portfolio URL"
            type="url"
            placeholder="https://"
            error={fieldErrors.portfolioUrl}
          />
          <TextField
            name="linkedinUrl"
            label="LinkedIn (optional)"
            type="url"
            placeholder="https://"
            error={fieldErrors.linkedinUrl}
          />
          <TextField
            name="personalWebsite"
            label="Personal website (optional)"
            type="url"
            placeholder="https://"
            error={fieldErrors.personalWebsite}
            className="sm:col-span-2"
          />
        </div>
      </Fieldset>

      <Fieldset legend="Tell us more">
        <div className="space-y-8">
          <TextArea
            name="aboutYou"
            label="Tell us about yourself"
            required
            rows={5}
            error={fieldErrors.aboutYou}
          />
          <TextArea
            name="whyJeevan"
            label="Why Jeevan Productions?"
            required
            rows={5}
            error={fieldErrors.whyJeevan}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Resume">
        <UploadField
          name="resume"
          label="Upload your resume"
          required
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hint="PDF or Word document, up to 5MB."
          error={fieldErrors.resume}
        />
      </Fieldset>

      <CheckboxField
        name="consent"
        label="I consent to Jeevan Productions storing and reviewing this information for hiring purposes."
        required
        error={fieldErrors.consent}
      />

      <Turnstile />

      <SubmitButton />
    </form>
  );
}
