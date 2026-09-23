import { createDraftPost } from "../actions";

/**
 * `/admin/posts/new` — creates an empty draft and redirects into the editor.
 * Kept as a plain server-rendered redirect (rather than only a form button)
 * so a direct link or address-bar visit also works.
 */
export default async function NewPostPage() {
  await createDraftPost();
}
