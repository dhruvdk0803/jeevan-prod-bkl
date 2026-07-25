import { clsx } from "clsx";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * Accessible, on-brand form primitives shared by every form on the site.
 *
 * Editorial styling: underline-style fields on the paper background, no
 * boxed inputs. Every field wires up a real `<label htmlFor>`,
 * `aria-invalid`, and `aria-describedby` pointing at its error/hint text so
 * screen readers announce the same thing sighted users see. Errors render in
 * a `role="alert"` element so they're announced the moment they appear.
 */

const FIELD_HEIGHT = "min-h-11";

const inputBase = clsx(
  FIELD_HEIGHT,
  "w-full border-0 border-b border-ink/50 bg-transparent px-0 py-3 t-body text-ink placeholder:text-ink-3",
  "transition-colors duration-300 focus:border-ember focus:outline-none",
  "aria-[invalid=true]:border-ember-deep",
);

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-ember">
      {" "}
      *
    </span>
  );
}

/** Screen-reader + visual error text. Renders nothing when there is no error. */
export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="t-body mt-2 normal-case tracking-normal text-ember-deep">
      {children}
    </p>
  );
}

/** Groups related fields (e.g. a radio/choice set) with a real `<legend>`. */
export function Fieldset({
  legend,
  description,
  children,
  className,
  required,
}: {
  legend: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <fieldset className={clsx("min-w-0 border-0 p-0", className)}>
      <legend className="t-label mb-4 text-ink-3">
        {legend}
        {required ? <RequiredMark /> : null}
      </legend>
      {description ? <p className="t-body mb-4 text-ink-3">{description}</p> : null}
      {children}
    </fieldset>
  );
}

type SharedProps = {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
};

export function TextField({
  name,
  label,
  required,
  error,
  hint,
  className,
  type = "text",
  ...rest
}: SharedProps & { type?: string } & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "name" | "required" | "className" | "type" | "id"
  >) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="t-label block text-ink-3">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={inputBase}
        {...rest}
      />
      {hint ? (
        <p id={hintId} className="t-body mt-2 text-neutral">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export function TextArea({
  name,
  label,
  required,
  error,
  hint,
  className,
  rows = 5,
  ...rest
}: SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "required" | "className" | "id">) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="t-label block text-ink-3">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      <textarea
        id={id}
        name={name}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        rows={rows}
        className={clsx(inputBase, "resize-y py-3 leading-relaxed")}
        {...rest}
      />
      {hint ? (
        <p id={hintId} className="t-body mt-2 text-neutral">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export function SelectField({
  name,
  label,
  required,
  error,
  hint,
  className,
  options,
  placeholder = "Select one",
  ...rest
}: SharedProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "required" | "className" | "id"> & {
    options: string[];
    placeholder?: string;
  }) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={clsx("relative", className)}>
      <label htmlFor={id} className="t-label block text-ink-3">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          defaultValue=""
          className={clsx(inputBase, "appearance-none pr-7")}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hint ? (
        <p id={hintId} className="t-body mt-2 text-neutral">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  required,
  error,
  className,
  ...rest
}: SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "required" | "className" | "id" | "type">) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer border border-ink/50 accent-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          {...rest}
        />
        <label htmlFor={id} className="t-body min-h-11 cursor-pointer py-1 text-ink-3">
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export function UploadField({
  name,
  label,
  required,
  error,
  hint,
  className,
  accept,
  ...rest
}: SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "required" | "className" | "id" | "type">) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="t-label block text-ink-3">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={clsx(
          "block w-full border-b border-ink/50 bg-transparent py-3 t-body text-ink",
          "file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2.5 file:t-label file:text-paper file:transition-colors file:duration-300 hover:file:bg-ember",
          "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember",
          "aria-[invalid=true]:border-ember-deep",
        )}
        {...rest}
      />
      {hint ? (
        <p id={hintId} className="t-body mt-2 text-neutral">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
