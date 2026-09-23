"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { clsx } from "clsx";
import { Button } from "@/components/admin/ui";
import { MediaPicker, type PickedMedia } from "@/components/admin/media/MediaPicker";
import "./editor.css";

/**
 * Tiptap v3 rich-text editor with a sticky toolbar. Stored as HTML (what the
 * public site renders, after server-side sanitising) + the editor's own JSON
 * (round-trips formatting Tiptap's HTML serialiser would otherwise lose nuance
 * on, and is what re-opens the doc for editing without a lossy HTML parse).
 */
export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = "Start writing…",
}: {
  initialContent: string;
  onChange: (html: string, json: unknown) => void;
  placeholder?: string;
}) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: false },
      }),
      Image.configure({ inline: false, HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent || "",
    editorProps: {
      attributes: { class: "jp-editor-prose", spellcheck: "true" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.getJSON()),
  });

  useEffect(() => () => editor?.destroy(), [editor]);

  function openLinkDialog() {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(existing ?? "");
    setLinkError(null);
    setLinkDialogOpen(true);
    requestAnimationFrame(() => linkInputRef.current?.focus());
  }

  function isValidLinkUrl(url: string) {
    return /^https?:\/\/\S+$/i.test(url) || /^mailto:\S+@\S+$/i.test(url) || /^\/\S*$/.test(url) || /^#\S*$/.test(url);
  }

  function applyLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkDialogOpen(false);
      return;
    }
    if (!isValidLinkUrl(url)) {
      setLinkError("Enter an http(s) URL, a relative path starting with /, or a mailto: link.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkDialogOpen(false);
  }

  function insertImage(media: PickedMedia) {
    editor?.chain().focus().setImage({ src: media.url, alt: media.alt }).run();
  }

  if (!editor) {
    return <div className="text-neutral border-ink/10 rounded-b-xl border border-t-0 bg-white px-5 py-10 text-sm">Loading editor…</div>;
  }

  return (
    <div className="border-ink/10 overflow-hidden rounded-xl border bg-white">
      <Toolbar editor={editor} onLink={openLinkDialog} onImage={() => setImagePickerOpen(true)} />
      <div className="px-5 py-5 sm:px-8 sm:py-7">
        <EditorContent editor={editor} />
      </div>

      {linkDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" role="dialog" aria-modal="true" aria-label="Insert link">
          <div className="border-ink/10 w-full max-w-sm rounded-xl border bg-white p-4 shadow-xl">
            <p className="text-ink mb-2 text-sm font-semibold">Link</p>
            <input
              ref={linkInputRef}
              type="text"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                setLinkError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") setLinkDialogOpen(false);
              }}
              placeholder="https://example.com, /work, or mailto:hi@…"
              className="border-ink/15 text-ink placeholder:text-neutral-2 focus:border-ink/40 h-10 w-full rounded-lg border bg-white px-3 text-sm"
            />
            {linkError ? <p className="text-ember mt-1.5 text-[0.75rem]">{linkError}</p> : null}
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={applyLink}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <MediaPicker open={imagePickerOpen} onClose={() => setImagePickerOpen(false)} onSelect={insertImage} title="Insert image" />
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "text-ink-3 hover:bg-ink/5 hover:text-ink flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-[0.85rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="bg-ink/10 mx-1 h-6 w-px shrink-0" aria-hidden="true" />;
}

function Toolbar({ editor, onLink, onImage }: { editor: Editor; onLink: () => void; onImage: () => void }) {
  return (
    <div className="jp-editor-toolbar border-ink/10 flex flex-wrap items-center gap-0.5 border-b bg-white px-3 py-2">
      <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        {"</>"}
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </ToolbarButton>
      <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “ ”
      </ToolbarButton>
      <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {"{ }"}
      </ToolbarButton>
      <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ―
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={onLink}>
        Link
      </ToolbarButton>
      <ToolbarButton label="Image" onClick={onImage}>
        Image
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  );
}
