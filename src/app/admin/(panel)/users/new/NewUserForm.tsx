"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Input, Select } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { createUser } from "../actions";

export function NewUserForm({ minPasswordLength }: { minPasswordLength: number }) {
  const [state, formAction, pending] = useActionState(createUser, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" required aria-invalid={Boolean(state.fieldErrors?.name)} />
      </Field>

      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" required aria-invalid={Boolean(state.fieldErrors?.email)} />
      </Field>

      <Field label="Role" htmlFor="role">
        <Select id="role" name="role" defaultValue="editor">
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>

      <Field
        label="Temporary password"
        htmlFor="password"
        hint={`At least ${minPasswordLength} characters. Share it securely — they can change it from Account.`}
        error={state.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="text"
          minLength={minPasswordLength}
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <Button type="submit" variant="primary" disabled={pending} className="mt-2 self-start">
        {pending ? "Creating…" : "Create user"}
      </Button>
    </form>
  );
}
