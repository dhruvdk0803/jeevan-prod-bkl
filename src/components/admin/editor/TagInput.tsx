"use client";

import { useId, useMemo, useState } from "react";
import { clsx } from "clsx";

/**
 * Type-ahead tag chips. Suggestions come from `allTagNames` (every tag in
 * use); typing a name that doesn't match anything still works — new tags are
 * created server-side on save by slugifying the name.
 */
export function TagInput({
  value,
  onChange,
  allTagNames,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  allTagNames: string[];
}) {
  const [input, setInput] = useState("");
  const listId = useId();

  const suggestions = useMemo(() => {
    const term = input.trim().toLowerCase();
    const used = new Set(value.map((t) => t.toLowerCase()));
    return allTagNames.filter((t) => !used.has(t.toLowerCase()) && (term === "" || t.toLowerCase().includes(term))).slice(0, 8);
  }, [input, allTagNames, value]);

  function addTag(raw: string) {
    const name = raw.trim();
    if (!name) return;
    if (value.some((t) => t.toLowerCase() === name.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...value, name]);
    setInput("");
  }

  function removeTag(name: string) {
    onChange(value.filter((t) => t !== name));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span key={tag} className="bg-ink/5 text-ink-3 inline-flex items-center gap-1 rounded-full py-1 pr-1.5 pl-2.5 text-[0.78rem]">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="hover:bg-ink/10 flex h-5 w-5 items-center justify-center rounded-full"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          list={listId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            } else if (e.key === "Backspace" && input === "" && value.length > 0) {
              removeTag(value[value.length - 1]);
            }
          }}
          onBlur={() => {
            if (input.trim()) addTag(input);
          }}
          placeholder={value.length ? "Add another…" : "Add a tag and press Enter…"}
          className={clsx(
            "text-ink placeholder:text-neutral-2 h-8 min-w-32 flex-1 border-none bg-transparent text-sm outline-none",
          )}
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
