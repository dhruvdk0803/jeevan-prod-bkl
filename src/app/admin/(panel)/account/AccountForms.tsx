"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Input, Textarea } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { updateOwnProfile, changeOwnPassword } from "./actions";

export function ProfileForm({ name, bio, avatarUrl }: { name: string; bio: string; avatarUrl: string }) {
  const [state, formAction, pending] = useActionState(updateOwnProfile, initialActionState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}
      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={name} required />
      </Field>
      <Field label="Bio" htmlFor="bio" hint="Shown on your posts' byline." error={state.fieldErrors?.bio}>
        <Textarea id="bio" name="bio" defaultValue={bio} rows={3} />
      </Field>
      <Field label="Avatar URL" htmlFor="avatarUrl" error={state.fieldErrors?.avatarUrl}>
        <Input id="avatarUrl" name="avatarUrl" type="url" defaultValue={avatarUrl} placeholder="https://…" />
      </Field>
      <Button type="submit" variant="primary" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changeOwnPassword, initialActionState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}
      <Field label="Current password" htmlFor="currentPassword" error={state.fieldErrors?.currentPassword}>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password" htmlFor="newPassword" error={state.fieldErrors?.newPassword}>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" variant="primary" disabled={pending} className="self-start">
        {pending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
