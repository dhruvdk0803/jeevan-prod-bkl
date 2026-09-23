"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Card, Checkbox, Field, Input, Textarea } from "@/components/admin/ui";
import { MediaPicker, type PickedMedia } from "@/components/admin/media/MediaPicker";
import type { SeoAnalysis, SeoCheckStatus } from "@/lib/cms/seo-analysis";

const SITE_HOST = "www.jeevanproductions.com";

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const statusDot: Record<SeoCheckStatus, string> = {
  pass: "bg-emerald-600",
  warn: "bg-amber-500",
  fail: "bg-ember",
};

export function SeoPanel({
  metaTitle,
  metaDescription,
  focusKeyword,
  canonicalUrl,
  ogImageUrl,
  noindex,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onFocusKeywordChange,
  onCanonicalUrlChange,
  onOgImageChange,
  onNoindexChange,
  fallbackTitle,
  fallbackDescription,
  slug,
  analysis,
}: {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogImageUrl: string;
  noindex: boolean;
  onMetaTitleChange: (v: string) => void;
  onMetaDescriptionChange: (v: string) => void;
  onFocusKeywordChange: (v: string) => void;
  onCanonicalUrlChange: (v: string) => void;
  onOgImageChange: (media: PickedMedia | null) => void;
  onNoindexChange: (v: boolean) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  slug: string;
  analysis: SeoAnalysis;
}) {
  const [ogPickerOpen, setOgPickerOpen] = useState(false);

  const serpTitle = truncate(metaTitle.trim() || fallbackTitle || "Untitled post", 60);
  const serpDescription = truncate(metaDescription.trim() || fallbackDescription || "", 160);

  return (
    <Card title="SEO" description="How this post appears in search and when shared.">
      <div className="flex flex-col gap-5">
        <Field
          label="Meta title"
          htmlFor="metaTitle"
          hint={`Falls back to the post title (${fallbackTitle.length} chars) when left blank.`}
          counter={{ value: metaTitle.length, min: 50, max: 60 }}
        >
          <Input
            id="metaTitle"
            name="metaTitle"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder={fallbackTitle}
          />
        </Field>

        <Field
          label="Meta description"
          htmlFor="metaDescription"
          hint="Falls back to the excerpt when left blank."
          counter={{ value: metaDescription.length, min: 120, max: 160 }}
        >
          <Textarea
            id="metaDescription"
            name="metaDescription"
            rows={3}
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder={fallbackDescription}
          />
        </Field>

        <Field label="Focus keyword" htmlFor="focusKeyword" hint="The phrase this post should rank for.">
          <Input id="focusKeyword" name="focusKeyword" value={focusKeyword} onChange={(e) => onFocusKeywordChange(e.target.value)} placeholder="e.g. wedding videography pricing" />
        </Field>

        <Field label="Canonical URL" htmlFor="canonicalUrl" hint="Optional — only set if this content is republished from elsewhere.">
          <Input
            id="canonicalUrl"
            name="canonicalUrl"
            type="url"
            value={canonicalUrl}
            onChange={(e) => onCanonicalUrlChange(e.target.value)}
            placeholder="https://…"
          />
        </Field>

        <Field label="Social / OG image override" htmlFor="ogImage" hint="Falls back to the cover image, then the site default.">
          <div className="flex items-center gap-3">
            {ogImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary preview thumbnail from media library
              <img src={ogImageUrl} alt="" className="border-ink/10 h-14 w-14 shrink-0 rounded-md border object-cover" />
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOgPickerOpen(true)}
                className="border-ink/15 text-ink hover:border-ink/30 hover:bg-paper inline-flex h-9 items-center rounded-lg border bg-white px-3 text-[0.8rem] font-medium"
              >
                {ogImageUrl ? "Replace" : "Choose image"}
              </button>
              {ogImageUrl ? (
                <button
                  type="button"
                  onClick={() => onOgImageChange(null)}
                  className="text-ink-3 hover:text-ember inline-flex h-9 items-center px-2 text-[0.8rem] font-medium"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </Field>

        <input type="hidden" name="ogImageUrl" value={ogImageUrl} />

        <Checkbox
          label="Noindex"
          name="noindex"
          hint="Hide this post from search engines. It stays reachable by direct link."
          checked={noindex}
          onChange={(e) => onNoindexChange(e.target.checked)}
        />

        <div>
          <p className="text-ink-3 mb-2 text-[0.72rem] font-medium tracking-wide uppercase">Google preview</p>
          <div className="rounded-lg border border-transparent bg-[#fff] px-1 py-1 font-sans">
            <p className="truncate text-[0.8rem] text-[#202124]">
              {SITE_HOST} <span className="text-[#5f6368]">› blog › {slug || "…"}</span>
            </p>
            <p className="truncate text-[1.15rem] text-[#1a0dab]">{serpTitle}</p>
            <p className="text-[0.85rem] text-[#4d5156]">{serpDescription || "No description yet."}</p>
          </div>
        </div>

        <div>
          <p className="text-ink-3 mb-2 text-[0.72rem] font-medium tracking-wide uppercase">Social card preview</p>
          <div className="border-ink/10 overflow-hidden rounded-lg border bg-white">
            <div className="bg-paper-2 aspect-[1.91/1] w-full overflow-hidden">
              {ogImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary preview thumbnail from media library
                <img src={ogImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="text-neutral-2 flex h-full items-center justify-center text-[0.75rem]">No image set</div>
              )}
            </div>
            <div className="px-3 py-2.5">
              <p className="text-neutral text-[0.7rem] tracking-wide uppercase">{SITE_HOST}</p>
              <p className="text-ink mt-0.5 truncate text-[0.9rem] font-semibold">{serpTitle}</p>
              <p className="text-neutral truncate text-[0.78rem]">{serpDescription}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-ink-3 text-[0.72rem] font-medium tracking-wide uppercase">SEO checklist</p>
            <span className={clsx("text-sm font-semibold tabular-nums", analysis.score >= 80 ? "text-emerald-700" : analysis.score >= 50 ? "text-amber-700" : "text-ember")}>
              {analysis.score}/100
            </span>
          </div>
          <div className="bg-ink/10 mb-3 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={clsx("h-full rounded-full transition-[width]", analysis.score >= 80 ? "bg-emerald-600" : analysis.score >= 50 ? "bg-amber-500" : "bg-ember")}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
          <ul className="flex flex-col gap-2">
            {analysis.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <span className={clsx("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", statusDot[c.status])} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="text-ink block text-[0.8rem] font-medium">{c.label}</span>
                  <span className="text-neutral block text-[0.75rem]">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <MediaPicker
        open={ogPickerOpen}
        onClose={() => setOgPickerOpen(false)}
        onSelect={(m) => onOgImageChange(m)}
        title="Choose social share image"
      />
    </Card>
  );
}
