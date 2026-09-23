import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";
import { put, del } from "@vercel/blob";
import { slugify } from "./slug";

/**
 * Upload storage for admin-managed media.
 *
 * - When `BLOB_READ_WRITE_TOKEN` is set (production), files go to Vercel Blob
 *   under `uploads/<yyyy>/<mm>/<slug>-<rand>.<ext>`, publicly accessible.
 * - Otherwise (local dev) files are written into `public/uploads/<yyyy>/<mm>/`
 *   and served by Next's static file handling at `/uploads/...`. This path is
 *   dev-only: in production without a blob token we fail loudly instead of
 *   writing into an ephemeral filesystem.
 *
 * Every upload is sniffed by magic bytes (not the client-declared MIME type)
 * before being accepted, capped at 8 MB, and measured with `image-size`.
 */

const MAX_BYTES = 8 * 1024 * 1024;

type Sniffed = { mimeType: string; ext: string };

/** Magic-byte sniffing for the image formats this CMS accepts. */
function sniff(bytes: Uint8Array): Sniffed | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mimeType: "image/png", ext: "png" };
  }
  // GIF: "GIF87a" or "GIF89a"
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return { mimeType: "image/gif", ext: "gif" };
  }
  // WEBP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mimeType: "image/webp", ext: "webp" };
  }
  // AVIF: ISO BMFF box, "ftyp" at offset 4, brand "avif"/"avis" at offset 8.
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70 &&
    bytes[8] === 0x61 &&
    bytes[9] === 0x76 &&
    bytes[10] === 0x69 &&
    (bytes[11] === 0x66 || bytes[11] === 0x73)
  ) {
    return { mimeType: "image/avif", ext: "avif" };
  }
  return null;
}

export class UploadError extends Error {}

export type StoredUpload = {
  url: string;
  pathname: string;
  size: number;
  mimeType: string;
  width: number | null;
  height: number | null;
};

function datePrefix(): { yyyy: string; mm: string } {
  const now = new Date();
  return { yyyy: String(now.getFullYear()), mm: String(now.getMonth() + 1).padStart(2, "0") };
}

/** Stores an uploaded image and returns its public URL + metadata. */
export async function storeUpload(file: File): Promise<StoredUpload> {
  if (file.size <= 0) throw new UploadError("The file is empty.");
  if (file.size > MAX_BYTES) throw new UploadError("Images must be 8 MB or smaller.");

  const buf = Buffer.from(await file.arrayBuffer());
  const sniffed = sniff(buf);
  if (!sniffed) {
    throw new UploadError("Unsupported file type. Upload a JPEG, PNG, WebP, AVIF or GIF image.");
  }

  let width: number | null = null;
  let height: number | null = null;
  try {
    const dim = imageSize(buf);
    width = dim.width ?? null;
    height = dim.height ?? null;
  } catch {
    /* dimensions are best-effort — some valid files (e.g. animated GIF edge cases) may fail */
  }

  const { yyyy, mm } = datePrefix();
  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "upload";
  const rand = Math.random().toString(36).slice(2, 8);
  const pathname = `uploads/${yyyy}/${mm}/${baseName}-${rand}.${sniffed.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, buf, {
      access: "public",
      contentType: sniffed.mimeType,
      addRandomSuffix: false,
    });
    return { url: blob.url, pathname: blob.pathname, size: buf.length, mimeType: sniffed.mimeType, width, height };
  }

  if (process.env.NODE_ENV === "production") {
    throw new UploadError(
      "File storage isn't configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) before uploading in production.",
    );
  }

  // Dev-only fallback: write into public/uploads so the file is served statically.
  const dir = path.join(process.cwd(), "public", "uploads", yyyy, mm);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${baseName}-${rand}.${sniffed.ext}`);
  await writeFile(filePath, buf);
  return { url: `/${pathname}`, pathname, size: buf.length, mimeType: sniffed.mimeType, width, height };
}

/** Deletes a previously stored upload (blob or local file). Never throws on "already gone". */
export async function deleteStored(pathname: string, url: string): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN && !url.startsWith("/uploads/")) {
    try {
      await del(url);
    } catch {
      /* already deleted, or store unreachable — nothing more we can do here */
    }
    return;
  }
  try {
    await unlink(path.join(process.cwd(), "public", pathname));
  } catch {
    /* file already gone */
  }
}
