"use client";
import { useActionState } from "react";
import { Button } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { deleteTag } from "./actions";

export function DeleteTagButton({ id, name, postCount }: { id: string; name: string; postCount: number }) {
  const [state, formAction, pending] = useActionState(deleteTag, initialActionState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const warn = postCount > 0 ? ` It will be removed from ${postCount} post${postCount === 1 ? "" : "s"}.` : "";
        if (!confirm(`Delete "${name}"?${warn}`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
      {state.message && !state.ok ? <p className="text-ember mt-1 text-[0.72rem]">{state.message}</p> : null}
    </form>
  );
}
