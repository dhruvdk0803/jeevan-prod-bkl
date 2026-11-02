"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import type { ShowcaseVideo as Video } from "@/content/showcase";

/**
 * One showcase film: muted and looping while it's on screen, paused when it
 * scrolls away (so a page of films never decodes six at once), with a sound
 * toggle for the testimonials. Turning sound on here mutes every other
 * showcase film, so two voices never talk over each other.
 *
 * `prefers-reduced-motion` or Save-Data → no autoplay; the poster stays up
 * until someone presses play.
 */

const SOUND_EVENT = "jp-showcase-sound";

export function ShowcaseVideo({
  video,
  className,
  shape = video.orientation,
}: {
  video: Video;
  className?: string;
  /** Frame shape; defaults to the film's own orientation. */
  shape?: Video["orientation"];
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    const onOtherSound = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== video.id) {
        el.muted = true;
        setMuted(true);
      }
    };
    window.addEventListener(SOUND_EVENT, onOtherSound);

    let io: IntersectionObserver | undefined;
    if (!reduce && !saveData) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.play().catch(() => {
              /* autoplay refused — the poster and play button stay up */
            });
          } else {
            el.pause();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
    }

    return () => {
      io?.disconnect();
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      window.removeEventListener(SOUND_EVENT, onOtherSound);
    };
  }, [video.id]);

  const togglePlay = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const toggleSound = () => {
    const el = ref.current;
    if (!el) return;
    const next = !el.muted;
    el.muted = next;
    setMuted(next);
    if (!next) {
      window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: video.id }));
      // Sound on means "I want to hear this one": start it from the top.
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  };


  return (
    <figure className={clsx("group", className)}>
      <div className={clsx(
          "bg-ink relative overflow-hidden",
          shape === "landscape" ? "aspect-video" : "aspect-[9/16]",
        )}>
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          src={video.src}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-label={`${video.title}: ${video.alt}`}
          onClick={togglePlay}
        />

        <div className="absolute right-3 bottom-3 flex gap-2">
          <ControlButton
            onClick={togglePlay}
            label={playing ? `Pause ${video.title}` : `Play ${video.title}`}
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
          </ControlButton>
          <ControlButton
            onClick={toggleSound}
            label={muted ? `Turn sound on for ${video.title}` : `Mute ${video.title}`}
            pressed={!muted}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 6h2.5l3.5-3v10L5 10H2.5z" fill="currentColor" />
              {muted ? (
                <path d="M11 6l3.5 4M14.5 6L11 10" />
              ) : (
                <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.5a6 6 0 0 1 0 9" />
              )}
            </svg>
          </ControlButton>
        </div>
      </div>

      <figcaption className="mt-4">
        <p className="t-h3 font-display">{video.title}</p>
        <p className="t-label text-neutral mt-2 [.on-dark_&]:text-paper/60">{video.kind}</p>
      </figcaption>
    </figure>
  );
}

function ControlButton({
  onClick,
  label,
  pressed,
  children,
}: {
  onClick: () => void;
  label: string;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="bg-ink/60 text-paper hover:bg-ember flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300"
    >
      {children}
    </button>
  );
}
