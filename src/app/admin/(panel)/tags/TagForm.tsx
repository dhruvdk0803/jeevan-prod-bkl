"use client";
import { useActionState, useState } from "react";
import { Alert, Button, Field, Input } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { slugify } from "@/lib/cms/slug";
import { saveTag } from "./actions";

type Tag = { id: string; name: string; slug: string };

export function TagForm({ tag }: { tag?: Tag }) {
  const [state, formAction, pending] = useActionState(saveTag, initialActionState);
  const [name, setName] = useState(tag?.name ?? "");
  const [slug, setSlug] = useState(tag?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(tag));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {tag ? <input type="hidden" name="id" value={tag.id} /> : null}
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}

      <Field label="Name" htmlFor="tag-name" error={state.fieldErrors?.name}>
        <Input
          id="tag-name"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
          aria-invalid={Boolean(state.fieldErrors?.name)}
        />
      </Field>

      <Field label="Slug" htmlFor="tag-slug" error={state.fieldErrors?.slug} hint="Used in the tag's URL: /blog/tag/<slug>">
        <Input
          id="tag-slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
          aria-invalid={Boolean(state.fieldErrors?.slug)}
        />
      </Field>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : tag ? "Save changes" : "Create tag"}
        </Button>
      </div>
    </form>
  );
}
