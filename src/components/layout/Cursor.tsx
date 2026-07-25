"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Cursor — a restrained custom cursor for media surfaces only.
 *
 * Deliberate constraints, in order of importance:
 * - It never replaces the OS cursor. The native pointer stays visible
 *   everywhere, so precision and affordances are never lost.
 * - It only appears over elements that opt in with `data-cursor="View"`.
 *   Elsewhere it is invisible, so it can't distract or mislead.
 * - Fine-pointer + no-reduced-motion only. Touch and keyboard users never
 *   load or see it.
 */
/* Whether the fine-pointer + no-reduced-motion conditions hold. Read via
 * `useSyncExternalStore` instead of an effect that calls setState, so it's
 * correct as soon as the client evaluates it, with no extra render pass. */
const subscribeToPointerCapability = (onStoreChange: () => void) => {
  const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  hover.addEventListener("change", onStoreChange);
  motion.addEventListener("change", onStoreChange);
  return () => {
    hover.removeEventListener("change", onStoreChange);
    motion.removeEventListener("change", onStoreChange);
  };
};
const getPointerCapabilitySnapshot = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getPointerCapabilityServerSnapshot = () => false;

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const enabled = useSyncExternalStore(
    subscribeToPointerCapability,
    getPointerCapabilitySnapshot,
    getPointerCapabilityServerSnapshot,
  );

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };

    const tick = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-110 hidden lg:block"
    >
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-paper text-ink transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          opacity: label ? 1 : 0,
          transform: label ? "scale(1)" : "scale(0.4)",
        }}
      >
        <span className="t-label">{label}</span>
      </div>
    </div>
  );
}
