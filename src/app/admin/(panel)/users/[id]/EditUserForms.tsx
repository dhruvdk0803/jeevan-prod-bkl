"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { updateRole, updateUserProfile, resetUserPassword, deleteUser } from "../actions";

export function RoleForm({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: "admin" | "editor";
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateRole, initialActionState);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}
      <div className="flex items-end gap-3">
        <Field label="Role" htmlFor="role" className="flex-1">
          <Select id="role" name="role" defaultValue={role} disabled={disabled}>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
        <Button type="submit" disabled={pending || disabled}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function ProfileForm({ userId, bio, avatarUrl }: { userId: string; bio: string; avatarUrl: string }) {
  const [state, formAction, pending] = useActionState(updateUserProfile, initialActionState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}
      <Field label="Bio" htmlFor="bio" error={state.fieldErrors?.bio}>
        <Textarea id="bio" name="bio" defaultValue={bio} rows={3} />
      </Field>
      <Field label="Avatar URL" htmlFor="avatarUrl" error={state.fieldErrors?.avatarUrl}>
        <Input id="avatarUrl" name="avatarUrl" type="url" defaultValue={avatarUrl} placeholder="https://…" />
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ userId, minPasswordLength }: { userId: string; minPasswordLength: number }) {
  const [state, formAction, pending] = useActionState(resetUserPassword, initialActionState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}
      <Field
        label="New password"
        htmlFor="password"
        hint={`At least ${minPasswordLength} characters.`}
        error={state.fieldErrors?.password}
      >
        <Input id="password" name="password" type="text" minLength={minPasswordLength} required />
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}

export function DeleteUserForm({ userId, userName }: { userId: string; userName: string }) {
  const [state, formAction, pending] = useActionState(deleteUser, initialActionState);
  return (
    <form
      action={formAction}
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        if (!confirm(`Delete ${userName}? This can't be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <Button type="submit" variant="danger" disabled={pending} className="self-start">
        {pending ? "Deleting…" : "Delete user"}
      </Button>
    </form>
  );
}
