"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero background film — muted, looping, inline, never blocks first paint.
 *
 * - The poster is the LCP element (preloaded by <Hero>), so the page is
 *   complete before a byte of video arrives.
 * - Mobile gets the 720p rendition via <source media>, desktop 1080p.
 * - `prefers-reduced-motion` or Save-Data → stays on the poster frame.
 * - Some browsers ignore the SSR'd `muted` attribute until hydration, so we
 *   force `muted` and call play() once mounted; `loop` restarts it forever.
 */

export const HERO_VIDEO_ID = "jp-hero-video";

export function HeroVideo({ poster }: { poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (reduce || saveData) {
      v.pause();
      v.removeAttribute("autoplay");
      return;
    }
    v.muted = true;
    v.play().catch(() => {
      /* autoplay refused (e.g. low-power mode) — the poster stays up */
    });
  }, []);

  return (
    <video
      ref={ref}
      id={HERO_VIDEO_ID}
      className="absolute inset-0 h-full w-full object-cover"
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/media/hero/hero-720.mp4" type="video/mp4" media="(max-width: 767px)" />
      <source src="/media/hero/hero-1080.mp4" type="video/mp4" />
    </video>
  );
}

/** Pause/play control for the background film (WCAG 2.2.2 Pause, Stop, Hide). */
export function HeroVideoToggle() {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = document.getElementById(HERO_VIDEO_ID) as HTMLVideoElement | null;
    if (!v) return;
    const sync = () => setPlaying(!v.paused);
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    // Reflect whatever HeroVideo decided on mount (reduced motion, Save-Data).
    const t = window.setTimeout(sync, 0);
    return () => {
      window.clearTimeout(t);
      v.removeEventListener("play", sync);
      v.removeEventListener("pause", sync);
    };
  }, []);

  const toggle = () => {
    const v = document.getElementById(HERO_VIDEO_ID) as HTMLVideoElement | null;
    if (!v) return;
    if (v.paused) {
      v.muted = true;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!playing}
      aria-label={playing ? "Pause background video" : "Play background video"}
      className="border-paper/30 text-paper/80 hover:border-paper hover:text-paper flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-300"
    >
      {playing ? (
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="1" width="3" height="10" rx="0.5" />
          <rect x="7" y="1" width="3" height="10" rx="0.5" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 1.5v9a.5.5 0 0 0 .77.42l7-4.5a.5.5 0 0 0 0-.84l-7-4.5A.5.5 0 0 0 3 1.5Z" />
        </svg>
      )}
    </button>
  );
}
