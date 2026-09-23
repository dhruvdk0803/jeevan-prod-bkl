/** Wraps sanitised CMS HTML with the `.jp-prose` typography from `blog-prose.css`. */
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={`jp-prose${className ? ` ${className}` : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
