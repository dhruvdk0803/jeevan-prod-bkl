"use client";
import { useRef, useState } from "react";
import { clsx } from "clsx";
import { Alert, Badge, Button, EmptyState, Input } from "@/components/admin/ui";
import { useMediaLibrary } from "./useMediaLibrary";
import type { MediaItem } from "./types";

/** The `/admin/media` library: upload, search, edit alt, copy URL, delete. */

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** One file queued for upload, waiting on its alt text. */
type QueuedUpload = { key: string; file: File; alt: string; status: "pending" | "uploading" | "error"; error?: string };

export function MediaLibrary() {
  const { items, total, query, setQuery, loading, error, hasMore, loadMore, upload, updateAlt, remove } =
    useMediaLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function enqueue(files: FileList | File[]) {
    const next: QueuedUpload[] = Array.from(files).map((file, i) => ({
      key: `${Date.now()}-${i}-${file.name}`,
      file,
      alt: "",
      status: "pending",
    }));
    setQueue((prev) => [...prev, ...next]);
  }

  function updateQueued(key: string, patch: Partial<QueuedUpload>) {
    setQueue((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  async function submitQueued(item: QueuedUpload) {
    if (!item.alt.trim()) {
      updateQueued(item.key, { status: "error", error: "Alt text is required." });
      return;
    }
    updateQueued(item.key, { status: "uploading", error: undefined });
    try {
      await upload(item.file, item.alt.trim());
      setQueue((prev) => prev.filter((q) => q.key !== item.key));
    } catch (err) {
      updateQueued(item.key, { status: "error", error: err instanceof Error ? err.message : "Upload failed." });
    }
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(new URL(item.url, window.location.origin).toString());
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500);
    } catch {
      /* clipboard unavailable — nothing to fall back to here */
    }
  }

  async function handleDelete(item: MediaItem) {
    try {
      await remove(item.id);
    } finally {
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className={clsx(
          "border-ink/15 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
          dragOver && "border-ink/40 bg-ink/5",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) enqueue(e.dataTransfer.files);
        }}
      >
        <p className="text-ink text-sm">Drag images here, or</p>
        <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()}>
          Choose files
        </Button>
        <p className="text-neutral text-[0.75rem]">JPEG, PNG, WebP, AVIF or GIF — up to 8 MB each.</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) enqueue(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {queue.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {queue.map((item) => (
            <li key={item.key} className="border-ink/10 flex flex-col gap-2 rounded-lg border bg-white p-3 sm:flex-row sm:items-center">
              <p className="text-ink min-w-0 flex-1 truncate text-sm" title={item.file.name}>
                {item.file.name} <span className="text-neutral">({formatSize(item.file.size)})</span>
              </p>
              <Input
                placeholder="Alt text (required)"
                value={item.alt}
                onChange={(e) => updateQueued(item.key, { alt: e.target.value, status: "pending" })}
                className="sm:max-w-xs"
                aria-label={`Alt text for ${item.file.name}`}
              />
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => submitQueued(item)}
                  disabled={item.status === "uploading"}
                >
                  {item.status === "uploading" ? "Uploading…" : "Upload"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQueue((prev) => prev.filter((q) => q.key !== item.key))}
                >
                  Remove
                </Button>
              </div>
              {item.status === "error" && item.error ? (
                <p className="text-ember basis-full text-[0.75rem]">{item.error}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <Input
        type="search"
        placeholder="Search by filename or alt text…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search media"
        className="max-w-sm"
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {!error && !loading && items.length === 0 ? (
        <EmptyState
          title="No media yet"
          description="Upload an image above to add it to the library. It'll be available from every image picker across the CMS."
        />
      ) : (
        <>
          <p className="text-neutral text-[0.8rem]">
            {total} {total === 1 ? "image" : "images"}
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onCopy={() => copyUrl(item)}
                copied={copiedId === item.id}
                onSaveAlt={(alt) => updateAlt(item.id, alt)}
                confirmingDelete={confirmDeleteId === item.id}
                onRequestDelete={() => setConfirmDeleteId(item.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onConfirmDelete={() => handleDelete(item)}
              />
            ))}
          </ul>
          {hasMore ? (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" onClick={loadMore} disabled={loading}>
                {loading ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function MediaCard({
  item,
  onCopy,
  copied,
  onSaveAlt,
  confirmingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  item: MediaItem;
  onCopy: () => void;
  copied: boolean;
  onSaveAlt: (alt: string) => Promise<MediaItem>;
  confirmingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(item.alt);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      await onSaveAlt(alt.trim());
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="border-ink/10 flex flex-col overflow-hidden rounded-xl border bg-white">
      <div className="relative aspect-square bg-[repeating-conic-gradient(#f4f2ee_0%_25%,#efece5_0%_50%)] bg-[length:16px_16px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- library thumbnails of arbitrary size */}
        <img src={item.url} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
        {!item.alt ? (
          <span className="bg-ember absolute top-1.5 right-1.5 rounded-full px-2 py-0.5 text-[0.65rem] font-medium text-white">
            Missing alt
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-ink truncate text-[0.8rem] font-medium" title={item.filename}>
          {item.filename}
        </p>
        <p className="text-neutral text-[0.72rem]">
          {item.width && item.height ? `${item.width} × ${item.height} · ` : ""}
          {formatSize(item.size)}
        </p>

        {editing ? (
          <div className="flex flex-col gap-1.5">
            <Input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              autoFocus
              aria-label={`Alt text for ${item.filename}`}
            />
            {saveError ? <p className="text-ember text-[0.72rem]">{saveError}</p> : null}
            <div className="flex gap-1.5">
              <Button variant="primary" size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setAlt(item.alt);
                  setSaveError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-left"
          >
            {item.alt ? (
              <p className="text-ink-3 line-clamp-2 text-[0.75rem]">{item.alt}</p>
            ) : (
              <Badge tone="warning">Add alt text</Badge>
            )}
          </button>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <Button variant="secondary" size="sm" onClick={onCopy} className="flex-1">
            {copied ? "Copied" : "Copy URL"}
          </Button>
          {confirmingDelete ? (
            <>
              <Button variant="danger" size="sm" onClick={onConfirmDelete}>
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancelDelete}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={onRequestDelete} aria-label={`Delete ${item.filename}`}>
              Delete
            </Button>
          )}
        </div>
        {confirmingDelete ? (
          <p className="text-ember text-[0.7rem]">
            If this image is used on a published post, it will show as a broken image there.
          </p>
        ) : null}
      </div>
    </li>
  );
}
