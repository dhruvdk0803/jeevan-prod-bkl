"use client";
import { useActionState, useState } from "react";
import { Alert, Button, Field, Input, Textarea } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { slugify } from "@/lib/cms/slug";
import { saveCategory } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction, pending] = useActionState(saveCategory, initialActionState);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [metaTitle, setMetaTitle] = useState(category?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(category?.metaDescription ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}

      <Field label="Name" htmlFor="cat-name" error={state.fieldErrors?.name}>
        <Input
          id="cat-name"
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

      <Field label="Slug" htmlFor="cat-slug" error={state.fieldErrors?.slug} hint="Used in the category's URL: /blog/category/<slug>">
        <Input
          id="cat-slug"
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

      <Field label="Description" htmlFor="cat-description" hint="Optional. Shown on the category archive page." error={state.fieldErrors?.description}>
        <Textarea id="cat-description" name="description" defaultValue={category?.description ?? ""} rows={3} />
      </Field>

      <Field
        label="Meta title"
        htmlFor="cat-metaTitle"
        counter={{ value: metaTitle.length, min: 50, max: 60 }}
        error={state.fieldErrors?.metaTitle}
      >
        <Input id="cat-metaTitle" name="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
      </Field>

      <Field
        label="Meta description"
        htmlFor="cat-metaDescription"
        counter={{ value: metaDescription.length, min: 120, max: 160 }}
        error={state.fieldErrors?.metaDescription}
      >
        <Textarea
          id="cat-metaDescription"
          name="metaDescription"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={2}
        />
      </Field>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : category ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
