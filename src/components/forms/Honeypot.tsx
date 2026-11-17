/** Name of the hidden field; the enquiry action discards anything that fills it. */
export const HONEYPOT_FIELD = "website";

/**
 * Honeypot spam trap: a text field moved off screen and hidden from screen
 * readers and the tab order. People never see it; form-filling bots do, and
 * fill it in.
 */
export function Honeypot({ id }: { id: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this empty</label>
      <input id={id} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
