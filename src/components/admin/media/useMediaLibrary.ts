"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "./types";

/**
 * Client-side data layer for the media library: search + pagination against
 * `GET /api/admin/media`, and upload against `POST /api/admin/media`. Shared
 * by `MediaPicker` (modal) and `MediaLibrary` (the `/admin/media` page).
 */
export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  // Current page doesn't need to trigger a render by itself — only the data
  // fetched for it does — so it's a ref rather than state.
  const page = useRef(1);

  const load = useCallback(async (q: string, p: number) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(q)}&page=${p}`, {
        cache: "no-store",
      });
      if (res.status === 401) throw new Error("Your session expired. Reload the page and sign in again.");
      if (!res.ok) throw new Error("Couldn't load the media library.");
      const data = (await res.json()) as { items: MediaItem[]; total: number };
      if (id !== requestId.current) return;
      setItems((prev) => (p === 1 ? data.items : [...prev, ...data.items]));
      setTotal(data.total);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    page.current = 1;
    // Deferred to a microtask so the fetch's setState calls happen outside
    // this effect's own synchronous run. `load`'s own requestId guard drops
    // the result of a superseded search, so no cancellation is needed here.
    queueMicrotask(() => void load(query, 1));
  }, [query, load]);

  const loadMore = useCallback(() => {
    const next = page.current + 1;
    page.current = next;
    void load(query, next);
  }, [load, query]);

  const upload = useCallback(async (file: File, alt: string): Promise<MediaItem> => {
    const form = new FormData();
    form.set("file", file);
    form.set("alt", alt);
    const res = await fetch("/api/admin/media", { method: "POST", body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error((body as { error?: string } | null)?.error ?? "Upload failed.");
    }
    const item = (await res.json()) as MediaItem;
    setItems((prev) => [item, ...prev]);
    setTotal((t) => t + 1);
    return item;
  }, []);

  const updateAlt = useCallback(async (id: string, alt: string): Promise<MediaItem> => {
    const res = await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error((body as { error?: string } | null)?.error ?? "Couldn't save.");
    }
    const item = (await res.json()) as MediaItem;
    setItems((prev) => prev.map((m) => (m.id === id ? item : m)));
    return item;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error((body as { error?: string } | null)?.error ?? "Couldn't delete.");
    }
    setItems((prev) => prev.filter((m) => m.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  return {
    items,
    total,
    query,
    setQuery,
    loading,
    error,
    hasMore: items.length < total,
    loadMore,
    upload,
    updateAlt,
    remove,
    reload: () => load(query, 1),
  };
}
