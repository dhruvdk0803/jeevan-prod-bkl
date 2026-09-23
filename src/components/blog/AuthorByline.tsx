import Image from "next/image";
import type { PublicAuthor } from "@/lib/cms/types";

/** Byline with optional avatar + bio. Renders nothing beyond a name when no bio/avatar is set. */
export function AuthorByline({ author, className }: { author: PublicAuthor; className?: string }) {
  return (
    <div className={`flex items-start gap-4 ${className ?? ""}`}>
      {author.avatarUrl ? (
        <Image
          src={author.avatarUrl}
          alt=""
          aria-hidden="true"
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="bg-paper-2 text-ink-3 t-label flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        >
          {author.name.slice(0, 1)}
        </span>
      )}
      <div>
        <p className="t-label text-neutral">Written by</p>
        <p className="t-body mt-1 font-medium">{author.name}</p>
        {author.bio ? <p className="t-body text-ink-3 mt-2 max-w-[48ch]">{author.bio}</p> : null}
      </div>
    </div>
  );
}
