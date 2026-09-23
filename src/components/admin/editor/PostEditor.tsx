"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/admin/ui";
import { MediaPicker, type PickedMedia } from "@/components/admin/media/MediaPicker";
import { slugify } from "@/lib/cms/slug";
import { analyzeSeo } from "@/lib/cms/seo-analysis";
import { initialActionState } from "@/lib/cms/action-state";
import { savePost, deletePost } from "@/app/admin/(panel)/posts/actions";
import { RichTextEditor } from "./RichTextEditor";
import { SeoPanel } from "./SeoPanel";
import { TagInput } from "./TagInput";

export type EditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentJson: unknown;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  status: "draft" | "published";
  publishedAt: string | null;
  categoryId: string | null;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogImageUrl: string | null;
  noindex: boolean;
  updatedAt: string;
  tags: { id: string; name: string }[];
  authorName: string | null;
};

const AUTOSAVE_MS = 30_000;

const noopSubscribe = () => () => {};

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function PostEditor({
  post,
  categories,
  allTagNames,
}: {
  post: EditorPost;
  categories: { id: string; name: string }[];
  allTagNames: string[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const draftSubmitRef = useRef<HTMLButtonElement>(null);

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [contentHtml, setContentHtml] = useState(post.content);
  const [contentJson, setContentJson] = useState<unknown>(post.contentJson);
  const [coverImage, setCoverImage] = useState<{ url: string; alt: string; width: number | null; height: number | null }>({
    url: post.coverImageUrl ?? "",
    alt: post.coverImageAlt ?? "",
    width: post.coverImageWidth,
    height: post.coverImageHeight,
  });
  const [categoryId, setCategoryId] = useState(post.categoryId ?? "");
  const [tags, setTags] = useState(post.tags.map((t) => t.name));
  const [status, setStatus] = useState(post.status);
  const [publishedAtLocal, setPublishedAtLocal] = useState(isoToLocalInput(post.publishedAt));
  // Local-time values (publish date, "Saved · 3:09 PM") depend on the
  // browser's timezone, which the server (UTC on Vercel) doesn't know. Render
  // them only once mounted so server and client HTML always match.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [metaTitle, setMetaTitle] = useState(post.metaTitle);
  const [metaDescription, setMetaDescription] = useState(post.metaDescription);
  const [focusKeyword, setFocusKeyword] = useState(post.focusKeyword);
  const [canonicalUrl, setCanonicalUrl] = useState(post.canonicalUrl);
  const [ogImageUrl, setOgImageUrl] = useState(post.ogImageUrl ?? "");
  const [noindex, setNoindex] = useState(post.noindex);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  const [savedAt, setSavedAt] = useState<Date | null>(new Date(post.updatedAt));
  const [dirty, setDirty] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const savePostForId = useMemo(() => savePost.bind(null, post.id), [post.id]);
  const [state, formAction, pending] = useActionState(savePostForId, initialActionState);

  // Any change to a tracked field marks the doc dirty until the next save.
  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
    setDirty(true);
  }

  // Sync local state from a freshly-completed save. This runs during render
  // (React's documented pattern for deriving state from a changing value
  // across renders) rather than in an effect, since `state` only changes
  // once per submission and we need to react to it synchronously.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.ok) {
      setDirty(false);
      setSavedAt(new Date());
      if (typeof state.data?.status === "string" && state.data.status !== status) {
        setStatus(state.data.status as "draft" | "published");
      }
      if (typeof state.data?.slug === "string" && state.data.slug !== slug) {
        setSlug(state.data.slug);
      }
      // Reflect the server-assigned publish date (e.g. "now" on first publish).
      if (typeof state.data?.publishedAt === "string") {
        setPublishedAtLocal(isoToLocalInput(state.data.publishedAt));
      }
    }
  }

  // router.refresh() is a genuine side effect (re-fetches the server tree),
  // so it stays in an effect — it just never calls a state setter itself.
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  // Unsaved-changes guard.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Ctrl/Cmd+S saves without leaving the page.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        draftSubmitRef.current?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Autosave every 30s, only while the post is a draft — never auto-publishes
  // and never silently touches an already-published post.
  useEffect(() => {
    if (status !== "draft") return;
    const id = window.setInterval(() => {
      if (dirty && !pending) draftSubmitRef.current?.click();
    }, AUTOSAVE_MS);
    return () => window.clearInterval(id);
  }, [status, dirty, pending]);

  const analysis = useMemo(
    () =>
      analyzeSeo({
        title,
        slug,
        metaTitle,
        metaDescription,
        excerpt,
        focusKeyword,
        html: contentHtml,
        coverImageUrl: coverImage.url,
        coverImageAlt: coverImage.alt,
      }),
    [title, slug, metaTitle, metaDescription, excerpt, focusKeyword, contentHtml, coverImage],
  );

  const isFuturePublish = publishedAtLocal ? localInputToIso(publishedAtLocal) > new Date().toISOString() : false;

  function onCoverSelect(media: PickedMedia) {
    setCoverImage({ url: media.url, alt: media.alt, width: media.width, height: media.height });
    setDirty(true);
  }

  async function onDelete() {
    if (!window.confirm(`Delete “${title || "this post"}”? This can't be undone.`)) return;
    setDeleting(true);
    await deletePost(post.id);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => setDirty(false)}
      className="flex flex-col gap-6 xl:flex-row xl:items-start"
    >
      {/* ---- Writing canvas ---- */}
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone={status === "draft" ? "neutral" : isFuturePublish ? "info" : "success"}>
            {status === "draft" ? "Draft" : isFuturePublish ? "Scheduled" : "Published"}
          </Badge>
          {noindex ? <Badge tone="warning">Noindex</Badge> : null}
          <span className="text-neutral text-[0.78rem]">
            {pending ? "Saving…" : savedAt
                ? mounted
                  ? `Saved · ${savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                  : "Saved"
                : "Not saved yet"}
          </span>
        </div>

        {state.message ? <div className="mb-4"><Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert></div> : null}

        <input
          name="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          aria-label="Post title"
          className="font-display text-ink placeholder:text-neutral-2 mb-4 w-full border-none bg-transparent text-[2rem] leading-tight outline-none sm:text-[2.4rem]"
        />

        <RichTextEditor
          initialContent={post.content}
          onChange={(html, json) => {
            setContentHtml(html);
            setContentJson(json);
            setDirty(true);
          }}
          placeholder="Start writing…"
        />

        <input type="hidden" name="contentHtml" value={contentHtml} />
        <input type="hidden" name="contentJson" value={contentJson ? JSON.stringify(contentJson) : ""} />
      </div>

      {/* ---- Sidebar ---- */}
      <div className="flex w-full flex-col gap-5 xl:w-80 xl:shrink-0 2xl:w-96">
        <Card title="Publish">
          <div className="flex flex-col gap-4">
            <Field label="Publish date & time" htmlFor="publishedAtLocal" hint="A future date & time schedules the post.">
              <Input
                id="publishedAtLocal"
                type="datetime-local"
                value={mounted ? publishedAtLocal : ""}
                onChange={(e) => markDirty(setPublishedAtLocal)(e.target.value)}
              />
            </Field>
            <input
              type="hidden"
              name="publishedAt"
              value={mounted ? localInputToIso(publishedAtLocal) : (post.publishedAt ?? "")}
            />

            <div className="flex flex-wrap gap-2">
              {status === "draft" ? (
                <>
                  <button ref={draftSubmitRef} type="submit" name="status" value="draft" disabled={pending} className="hidden" aria-hidden="true" />
                  <Button type="submit" name="status" value="draft" variant="secondary" disabled={pending}>
                    Save draft
                  </Button>
                  <Button type="submit" name="status" value="published" variant="primary" disabled={pending}>
                    {isFuturePublish ? "Schedule" : "Publish"}
                  </Button>
                </>
              ) : (
                <>
                  <button ref={draftSubmitRef} type="submit" name="status" value="published" disabled={pending} className="hidden" aria-hidden="true" />
                  <Button type="submit" name="status" value="published" variant="primary" disabled={pending}>
                    Update
                  </Button>
                  <Button type="submit" name="status" value="draft" variant="secondary" disabled={pending}>
                    Unpublish
                  </Button>
                </>
              )}
            </div>

            <div className="border-ink/10 flex flex-wrap items-center gap-3 border-t pt-3">
              <a
                href={`/api/admin/preview?id=${post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-ember text-[0.8rem] font-medium"
              >
                Preview ↗
              </a>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="text-ember hover:text-ember-deep ml-auto text-[0.8rem] font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete post"}
              </button>
            </div>
            {post.authorName ? <p className="text-neutral-2 text-[0.72rem]">By {post.authorName}</p> : null}
          </div>
        </Card>

        <Card title="Slug">
          <Field label="URL slug" htmlFor="slug" hint={`/blog/${slug || "…"}`} error={state.fieldErrors?.slug}>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                markDirty(setSlug)(slugify(e.target.value));
              }}
              aria-invalid={Boolean(state.fieldErrors?.slug)}
            />
          </Field>
        </Card>

        <Card title="Excerpt">
          <Field label="Excerpt" htmlFor="excerpt" counter={{ value: excerpt.length, max: 200 }}>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => markDirty(setExcerpt)(e.target.value)}
              placeholder="A short summary shown on the blog index and search results."
            />
          </Field>
        </Card>

        <Card title="Cover image">
          <div className="flex flex-col gap-3">
            {coverImage.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary preview thumbnail from media library
              <img src={coverImage.url} alt="" className="border-ink/10 aspect-video w-full rounded-lg border object-cover" />
            ) : null}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setCoverPickerOpen(true)}>
                {coverImage.url ? "Replace" : "Choose image"}
              </Button>
              {coverImage.url ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCoverImage({ url: "", alt: "", width: null, height: null });
                    setDirty(true);
                  }}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            {coverImage.url ? (
              <Field label="Alt text" htmlFor="coverImageAlt" hint="Required for SEO and accessibility." error={state.fieldErrors?.coverImageAlt}>
                <Input
                  id="coverImageAlt"
                  name="coverImageAlt"
                  value={coverImage.alt}
                  onChange={(e) => markDirty(setCoverImage)({ ...coverImage, alt: e.target.value })}
                  aria-invalid={Boolean(state.fieldErrors?.coverImageAlt)}
                />
              </Field>
            ) : null}
            <input type="hidden" name="coverImageUrl" value={coverImage.url} />
            <input type="hidden" name="coverImageWidth" value={coverImage.width ?? ""} />
            <input type="hidden" name="coverImageHeight" value={coverImage.height ?? ""} />
          </div>
        </Card>

        <Card title="Category">
          <Field label="Category" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" value={categoryId} onChange={(e) => markDirty(setCategoryId)(e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        <Card title="Tags">
          <TagInput value={tags} onChange={(v) => markDirty(setTags)(v)} allTagNames={allTagNames} />
          {tags.map((t) => (
            <input key={t} type="hidden" name="tagNames" value={t} />
          ))}
        </Card>

        <SeoPanel
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          focusKeyword={focusKeyword}
          canonicalUrl={canonicalUrl}
          ogImageUrl={ogImageUrl}
          noindex={noindex}
          onMetaTitleChange={markDirty(setMetaTitle)}
          onMetaDescriptionChange={markDirty(setMetaDescription)}
          onFocusKeywordChange={markDirty(setFocusKeyword)}
          onCanonicalUrlChange={markDirty(setCanonicalUrl)}
          onOgImageChange={(media) => markDirty(setOgImageUrl)(media?.url ?? "")}
          onNoindexChange={markDirty(setNoindex)}
          fallbackTitle={title}
          fallbackDescription={excerpt}
          slug={slug}
          analysis={analysis}
        />
      </div>

      <MediaPicker open={coverPickerOpen} onClose={() => setCoverPickerOpen(false)} onSelect={onCoverSelect} title="Choose cover image" />
    </form>
  );
}
