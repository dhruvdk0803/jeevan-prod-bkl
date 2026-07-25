"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Cloudflare Turnstile widget. Loads the Turnstile script once, renders the
 * widget into a container div, and cleans both up on unmount.
 *
 * If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` isn't set, this renders nothing and the
 * surrounding form still works — the server action falls back to its own
 * dev-mode allowance (see `src/lib/form-security.ts`). This keeps the site
 * testable locally without Cloudflare credentials.
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Turnstile script failed to load")));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function Turnstile({ inputName = "turnstileToken" }: { inputName?: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const hiddenInputId = useId();

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (token: string) => {
            const input = document.getElementById(hiddenInputId) as HTMLInputElement | null;
            if (input) input.value = token;
          },
          "expired-callback": () => {
            const input = document.getElementById(hiddenInputId) as HTMLInputElement | null;
            if (input) input.value = "";
          },
        });
      })
      .catch(() => {
        // Fails open on the client — the server-side check is authoritative
        // and will fail closed in production if verification is unreachable.
      });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <div className="my-2">
      <input type="hidden" id={hiddenInputId} name={inputName} />
      <div ref={containerRef} />
    </div>
  );
}
