"use client";
import { useActionState } from "react";
import { Button } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { deleteRedirect } from "./actions";

export function DeleteRedirectButton({ id, source }: { id: string; source: string }) {
  const [, formAction, pending] = useActionState(deleteRedirect, initialActionState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Delete the redirect from "${source}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
