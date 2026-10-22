import { clsx } from "clsx";
import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * Accessible, on-brand form primitives shared by the contact and careers
 * forms.
 *
 * Editorial styling: underline-style fields on the paper background, no
 * boxed inputs. Every field wires up a real `<label htmlFor>`,
 * `aria-invalid`, and `aria-describedby` pointing at its error/hint text so
 * screen readers announce the same thing sighted users see. Errors render in
 * a `role="alert"` element so they're announced the moment they appear.
 *
 * Rhythm: label → 0.5rem → field → 0.5rem → hint/error. Every single-line
 * control (text, select, file) shares the same height so fields sitting side
 * by side in a grid line up on both their label and their underline.
 */

/** Shared underline + focus treatment for every control. */
const underline = clsx(
  "border-0 border-b border-ink/50 bg-transparent",
  "transition-[border-color,box-shadow] duration-300",
  // Underline fields get a 2px ember underline on focus instead of the global
  // boxed outline (which looks broken around a borderless field). The global
  // `:focus-visible` rule is unlayered, so the override needs `!`.
  "focus:outline-none! focus:border-ember focus:shadow-[0_1px_0_0_var(--color-ember)]",
  "aria-[invalid=true]:border-ember-deep aria-[invalid=true]:shadow-[0_1px_0_0_var(--color-ember-deep)]",
);

const inputBase = clsx(
  underline,
  "block w-full rounded-none px-0 t-body text-ink placeholder:text-neutral",
);

/** Fixed height for single-line controls so inputs and selects match exactly. */
const singleLine = "h-12 py-0";

const labelClass = "t-label mb-2 block text-ink-3";
const helperClass = "t-body mt-2";

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-ember">
      {" "}
      *
    </span>
  );
}

function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {label}
      {required ? <RequiredMark /> : null}
    </label>
  );
}

function FieldHint({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className={clsx(helperClass, "text-neutral")}>
      {children}
    </p>
  );
}

/** Screen-reader + visual error text. Renders nothing when there is no error. */
export function FieldError({
  id,
  children,
  className,
}: {
  id: string;
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className={clsx(helperClass, "text-ember-deep", className)}>
      {children}
    </p>
  );
}

/**
 * Form-level message shown above the fields after a failed submit. Focusable
 * so the form can move focus to it, and announced via `role="alert"`.
 */
export function ErrorSummary({
  message,
  ref,
}: {
  message: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-4 border-l-2 border-ember-deep bg-sand px-6 py-5"
    >
      <span
        aria-hidden="true"
        className="t-body flex h-[1.68em] shrink-0 items-center text-ember-deep"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="8.25" />
          <path d="M10 5.75v5.5" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <p className="t-body text-ink">{message}</p>
    </div>
  );
}

/**
 * Groups related fields under a real `<legend>`. The legend is floated so it
 * behaves like a normal block (full width, real margins) and can carry the
 * section hairline, giving each group a clear heading above its field labels.
 */
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
      <legend className="float-left mb-8 w-full border-t border-ink/13 p-0 pt-6 font-display t-lead text-ink">
        {legend}
        {required ? <RequiredMark /> : null}
      </legend>
      <div className="clear-left">
        {description ? <p className="t-body mb-6 text-ink-3">{description}</p> : null}
        {children}
      </div>
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

function describedByFor(id: string, hint?: string, error?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

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

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByFor(id, hint, error)}
        className={clsx(inputBase, singleLine)}
        {...rest}
      />
      <FieldHint id={`${id}-hint`}>{hint}</FieldHint>
      <FieldError id={`${id}-error`}>{error}</FieldError>
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

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        name={name}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByFor(id, hint, error)}
        rows={rows}
        className={clsx(inputBase, "min-h-32 resize-y py-3")}
        {...rest}
      />
      <FieldHint id={`${id}-hint`}>{hint}</FieldHint>
      <FieldError id={`${id}-error`}>{error}</FieldError>
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

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedByFor(id, hint, error)}
          defaultValue=""
          className={clsx(
            inputBase,
            singleLine,
            "cursor-pointer appearance-none pr-8",
            // Read as a placeholder (muted) until a real option is chosen.
            "has-[option[value='']:checked]:text-neutral [&_option]:text-ink",
          )}
          {...rest}
        >
          {/*
            Not `disabled`: a disabled selected option drops the field from the
            submitted FormData entirely (null server-side), which zod reports as
            a raw "Invalid input". Submitting "" lets optional selects pass and
            required ones show their own friendly message. It is hidden from the
            list on required selects so it can't be picked as an answer.
          */}
          <option value="" hidden={required}>
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
          className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <FieldHint id={`${id}-hint`}>{hint}</FieldHint>
      <FieldError id={`${id}-error`}>{error}</FieldError>
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
        {/* One body line tall, so the box centres on the label's first line. */}
        <span className="t-body flex h-[1.68em] shrink-0 items-center">
          <input
            id={id}
            name={name}
            type="checkbox"
            required={required}
            aria-required={required || undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="m-0 h-5 w-5 cursor-pointer accent-ember"
            {...rest}
          />
        </span>
        <label htmlFor={id} className="t-body cursor-pointer text-ink-3">
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      </div>
      {/* Indented to line up with the label text, not the checkbox. */}
      <FieldError id={errorId} className="pl-8">
        {error}
      </FieldError>
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

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByFor(id, hint, error)}
        className={clsx(
          underline,
          "block w-full cursor-pointer py-3 t-body text-ink-3",
          "file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2.5 file:t-label file:text-paper file:transition-colors file:duration-300 hover:file:bg-ember",
        )}
        {...rest}
      />
      <FieldHint id={`${id}-hint`}>{hint}</FieldHint>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
