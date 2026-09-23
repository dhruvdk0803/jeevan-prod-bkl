"use client";
import { useActionState, useState } from "react";
import { Alert, Button, Field, Input, Textarea } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { MediaPicker, type PickedMedia } from "@/components/admin/media/MediaPicker";
import type { SiteSettings } from "@/lib/cms/types";
import { saveSettings } from "./actions";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveSettings, initialActionState);
  const [seoTitleDefault, setSeoTitleDefault] = useState(settings.seoTitleDefault ?? "");
  const [seoDescriptionDefault, setSeoDescriptionDefault] = useState(settings.seoDescriptionDefault ?? "");
  const [blogMetaTitle, setBlogMetaTitle] = useState(settings.blogMetaTitle ?? "");
  const [blogMetaDescription, setBlogMetaDescription] = useState(settings.blogMetaDescription ?? "");
  const [defaultOgImageUrl, setDefaultOgImageUrl] = useState(settings.defaultOgImageUrl ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-sm font-semibold">Site-wide SEO defaults</h2>
        <Field
          label="Default title"
          htmlFor="s-seoTitleDefault"
          hint="Used when a page has no title of its own."
          counter={{ value: seoTitleDefault.length, min: 50, max: 60 }}
          error={state.fieldErrors?.seoTitleDefault}
        >
          <Input id="s-seoTitleDefault" name="seoTitleDefault" value={seoTitleDefault} onChange={(e) => setSeoTitleDefault(e.target.value)} />
        </Field>
        <Field
          label="Default meta description"
          htmlFor="s-seoDescriptionDefault"
          counter={{ value: seoDescriptionDefault.length, min: 120, max: 160 }}
          error={state.fieldErrors?.seoDescriptionDefault}
        >
          <Textarea id="s-seoDescriptionDefault" name="seoDescriptionDefault" value={seoDescriptionDefault} onChange={(e) => setSeoDescriptionDefault(e.target.value)} rows={2} />
        </Field>
        <Field label="Default social share image" htmlFor="s-defaultOgImageUrl" hint="Used for pages and posts without their own OG image. Stored exactly as chosen — in local dev this may be a relative /uploads URL.">
          <div className="flex items-center gap-3">
            {defaultOgImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin preview thumbnail
              <img src={defaultOgImageUrl} alt="" className="border-ink/10 h-14 w-24 rounded-md border object-cover" />
            ) : null}
            <input type="hidden" name="defaultOgImageUrl" value={defaultOgImageUrl} />
            <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
              {defaultOgImageUrl ? "Change image" : "Choose image"}
            </Button>
            {defaultOgImageUrl ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setDefaultOgImageUrl("")}>
                Remove
              </Button>
            ) : null}
          </div>
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-sm font-semibold">Blog</h2>
        <Field label="Blog heading" htmlFor="s-blogTitle" hint='Shown at the top of /blog. Leave blank for "Blog".'>
          <Input id="s-blogTitle" name="blogTitle" defaultValue={settings.blogTitle ?? ""} />
        </Field>
        <Field label="Blog intro" htmlFor="s-blogIntro">
          <Textarea id="s-blogIntro" name="blogIntro" defaultValue={settings.blogIntro ?? ""} rows={2} />
        </Field>
        <Field
          label="Blog meta title"
          htmlFor="s-blogMetaTitle"
          counter={{ value: blogMetaTitle.length, min: 50, max: 60 }}
        >
          <Input id="s-blogMetaTitle" name="blogMetaTitle" value={blogMetaTitle} onChange={(e) => setBlogMetaTitle(e.target.value)} />
        </Field>
        <Field
          label="Blog meta description"
          htmlFor="s-blogMetaDescription"
          counter={{ value: blogMetaDescription.length, min: 120, max: 160 }}
        >
          <Textarea id="s-blogMetaDescription" name="blogMetaDescription" value={blogMetaDescription} onChange={(e) => setBlogMetaDescription(e.target.value)} rows={2} />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-sm font-semibold">Search engines & analytics</h2>
        <Field
          label="Google Search Console verification"
          htmlFor="s-google"
          hint={
            <>
              Paste the token from the HTML tag method, or the whole {"<meta>"} tag — either works. See{" "}
              <a href="https://support.google.com/webmasters/answer/9008080" target="_blank" rel="noopener noreferrer" className="underline">
                Search Console verification docs
              </a>
              .
            </>
          }
          error={state.fieldErrors?.googleSiteVerification}
        >
          <Input id="s-google" name="googleSiteVerification" defaultValue={settings.googleSiteVerification ?? ""} />
        </Field>
        <Field
          label="Bing Webmaster verification"
          htmlFor="s-bing"
          hint={
            <>
              See{" "}
              <a href="https://www.bing.com/webmasters/help/how-to-verify-ownership-of-your-site-afcfefc6" target="_blank" rel="noopener noreferrer" className="underline">
                Bing Webmaster verification docs
              </a>
              .
            </>
          }
          error={state.fieldErrors?.bingSiteVerification}
        >
          <Input id="s-bing" name="bingSiteVerification" defaultValue={settings.bingSiteVerification ?? ""} />
        </Field>
        <Field label="GA4 measurement ID" htmlFor="s-ga4" hint="e.g. G-XXXXXXXXXX. Leave blank to disable analytics." error={state.fieldErrors?.ga4MeasurementId}>
          <Input id="s-ga4" name="ga4MeasurementId" defaultValue={settings.ga4MeasurementId ?? ""} placeholder="G-XXXXXXXXXX" />
        </Field>
      </section>

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m: PickedMedia) => setDefaultOgImageUrl(m.url)}
        title="Choose default social image"
      />
    </form>
  );
}
