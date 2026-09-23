"use client";
import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Button, Checkbox, Field, Input, Textarea } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { MediaPicker, type PickedMedia } from "@/components/admin/media/MediaPicker";
import { savePageSeo } from "./actions";
import type { StaticRoute } from "@/lib/cms/static-routes";

type Override = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  noindex: boolean;
} | null;

export function SeoForm({ route, override }: { route: StaticRoute; override: Override }) {
  const [state, formAction, pending] = useActionState(savePageSeo, initialActionState);
  const searchParams = useSearchParams();
  const justSaved = searchParams.get("saved") === "1";

  const [metaTitle, setMetaTitle] = useState(override?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(override?.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(override?.ogImageUrl ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  const previewTitle = metaTitle || route.defaultTitle;
  const previewDescription = metaDescription || route.defaultDescription;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="path" value={route.path} />
        {justSaved && !state.message ? <Alert tone="success">Saved.</Alert> : null}
        {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}

        <Field
          label="Meta title"
          htmlFor="seo-metaTitle"
          hint={`Default: "${route.defaultTitle}"`}
          counter={{ value: metaTitle.length, min: 50, max: 60 }}
          error={state.fieldErrors?.metaTitle}
        >
          <Input
            id="seo-metaTitle"
            name="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={route.defaultTitle}
          />
        </Field>

        <Field
          label="Meta description"
          htmlFor="seo-metaDescription"
          hint="Leave blank to use the page default."
          counter={{ value: metaDescription.length, min: 120, max: 160 }}
          error={state.fieldErrors?.metaDescription}
        >
          <Textarea
            id="seo-metaDescription"
            name="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            placeholder={route.defaultDescription}
          />
        </Field>

        <Field label="OG image" htmlFor="seo-ogImageUrl" hint="Social share image. Leave blank to use the site default.">
          <div className="flex items-center gap-3">
            {ogImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin preview thumbnail
              <img src={ogImageUrl} alt="" className="border-ink/10 h-14 w-24 rounded-md border object-cover" />
            ) : null}
            <input type="hidden" name="ogImageUrl" value={ogImageUrl} />
            <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
              {ogImageUrl ? "Change image" : "Choose image"}
            </Button>
            {ogImageUrl ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setOgImageUrl("")}>
                Remove
              </Button>
            ) : null}
          </div>
        </Field>

        <Checkbox
          label="Noindex this page"
          hint="Hides it from search engines. Use for thin or duplicate pages, not normally needed here."
          name="noindex"
          defaultChecked={override?.noindex ?? false}
        />

        <div>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>

      <div>
        <p className="text-neutral mb-2 text-[0.72rem] font-medium tracking-wide uppercase">Google preview</p>
        <div className="border-ink/10 rounded-xl border bg-white p-4">
          <p className="truncate text-[0.8rem] text-[#1a0dab]">
            jeevanproductions.com{route.path === "/" ? "" : route.path}
          </p>
          <p className="mt-0.5 truncate text-[1.1rem] text-[#1a0dab]">{previewTitle}</p>
          <p className="text-ink-3 mt-0.5 line-clamp-2 text-[0.85rem]">{previewDescription}</p>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m: PickedMedia) => setOgImageUrl(m.url)}
        title="Choose OG image"
      />
    </div>
  );
}
