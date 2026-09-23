import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  await requireUser();
  return (
    <div>
      <PageHeader
        title="Media"
        description="Upload and manage the images used across posts and pages. Every image needs alt text for accessibility and SEO."
      />
      <MediaLibrary />
    </div>
  );
}
