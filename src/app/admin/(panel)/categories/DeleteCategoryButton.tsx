"use client";
import { useActionState } from "react";
import { Button } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { deleteCategory } from "./actions";

export function DeleteCategoryButton({ id, name, postCount }: { id: string; name: string; postCount: number }) {
  const [state, formAction, pending] = useActionState(deleteCategory, initialActionState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const warn = postCount > 0 ? ` ${postCount} post${postCount === 1 ? "" : "s"} will lose this category.` : "";
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
