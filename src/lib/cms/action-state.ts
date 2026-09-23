/**
 * The one return shape for every admin Server Action, so forms render errors
 * and success toasts the same way everywhere. Use with React's
 * `useActionState(action, initialActionState)`.
 */
export type ActionState = {
  ok: boolean;
  /** Form-level message (error when !ok, confirmation when ok). */
  message?: string;
  /** Per-field errors keyed by input `name`. */
  fieldErrors?: Record<string, string>;
  /** Optional payload, e.g. `{ id }` of a created record. */
  data?: Record<string, unknown>;
};

export const initialActionState: ActionState = { ok: false };

/** Flatten a zod v4 error into `fieldErrors`. */
export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "form");
    out[key] ??= i.message;
  }
  return out;
}
