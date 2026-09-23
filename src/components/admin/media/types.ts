/** Shape returned by `GET/POST /api/admin/media` — mirrors the `media` table. */
export type MediaItem = {
  id: string;
  url: string;
  pathname: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  uploadedBy: string | null;
  createdAt: string;
};
