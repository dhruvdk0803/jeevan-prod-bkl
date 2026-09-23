"use client";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Alert, Button, Field, Input } from "@/components/admin/ui";
import { useMediaLibrary } from "./useMediaLibrary";
import type { MediaItem } from "./types";

/**
 * Modal media picker — grid of the library (searchable), drag/drop or file-
 * input upload with required alt text, click-or-Enter to select.
 *
 * Built on the native `<dialog>` element: `showModal()` gives us a focus trap
 * and top-layer stacking for free, and Esc closes it natively (we also wire
 * `onClose` so parents stay in sync with either dismissal path).
 */

export type PickedMedia = { id: string; url: string; alt: string; width: number | null; height: number | null };

const toPicked = (m: MediaItem): PickedMedia => ({ id: m.id, url: m.url, alt: m.alt, width: m.width, height: m.height });

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  title = "Choose an image",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (m: PickedMedia) => void;
  title?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { items, query, setQuery, loading, error, hasMore, loadMore, upload } = useMediaLibrary();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleClose() {
    setPendingFile(null);
    setAlt("");
    setUploadError(null);
    onClose();
  }

  function pickFile(file: File) {
    setPendingFile(file);
    setAlt("");
    setUploadError(null);
  }

  async function confirmUpload() {
    if (!pendingFile) return;
    if (!alt.trim()) {
      setUploadError("Alt text is required — it's how screen readers and search engines understand the image.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const item = await upload(pendingFile, alt.trim());
      setPendingFile(null);
      setAlt("");
      onSelect(toPicked(item));
      handleClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onCancel={handleClose}
      className="border-ink/10 w-[min(52rem,92vw)] rounded-2xl border bg-white p-0 shadow-xl backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
      aria-label={title}
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="border-ink/10 flex items-center justify-between gap-4 border-b px-5 py-4">
          <h2 className="font-display text-ink text-lg">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-ink-3 hover:bg-ink/5 hover:text-ink flex h-9 w-9 items-center justify-center rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        <div className="border-ink/10 border-b px-5 py-3">
          <Input
            type="search"
            placeholder="Search by filename or alt text…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search media"
          />
        </div>

        {pendingFile ? (
          <div className="border-ink/10 flex flex-col gap-3 border-b px-5 py-4">
            <p className="text-ink text-sm">
              Uploading <span className="font-medium">{pendingFile.name}</span> ({formatSize(pendingFile.size)})
            </p>
            <Field label="Alt text" htmlFor="picker-alt" hint="Required — describe what's in the image.">
              <Input
                id="picker-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                autoFocus
                placeholder="e.g. Team photographing a wedding reception at golden hour"
              />
            </Field>
            {uploadError ? <Alert tone="danger">{uploadError}</Alert> : null}
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={confirmUpload} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload & use"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPendingFile(null);
                  setUploadError(null);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              "border-ink/10 flex items-center justify-between gap-3 border-b px-5 py-3",
              dragOver && "bg-ink/5",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) pickFile(file);
            }}
          >
            <p className="text-neutral text-sm">Drag an image here, or</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Upload image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pickFile(file);
                e.target.value = "";
              }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error ? <Alert tone="danger">{error}</Alert> : null}
          {!error && !loading && items.length === 0 ? (
            <p className="text-neutral py-10 text-center text-sm">No images yet. Upload your first one above.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(toPicked(item));
                      handleClose();
                    }}
                    className="border-ink/10 hover:border-ink/40 focus-visible:outline-ink group relative block aspect-square w-full overflow-hidden rounded-lg border bg-[repeating-conic-gradient(#f4f2ee_0%_25%,#efece5_0%_50%)] bg-[length:16px_16px] focus-visible:outline-2 focus-visible:outline-offset-2"
                    title={item.alt || item.filename}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary aspect thumbnails from library + blob storage */}
                    <img src={item.url} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
                    {!item.alt ? (
                      <span className="bg-ember absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[0.65rem] font-medium text-white">
                        No alt
                      </span>
                    ) : null}
                    <span className="bg-ink/0 group-hover:bg-ink/10 absolute inset-0 transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {hasMore ? (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" size="sm" onClick={loadMore} disabled={loading}>
                {loading ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
