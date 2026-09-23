"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Input } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { login } from "./actions";

/** Email + password login form. Client component for `useActionState`. */
export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.message ? (
        <Alert tone="danger" title={state.message} />
      ) : null}

      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
      </Field>

      <Button type="submit" variant="primary" disabled={pending} className="mt-2 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
