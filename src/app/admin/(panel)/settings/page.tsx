import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/cms/public";
import { Card, PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader title="Settings" description="Site-wide SEO defaults, blog copy and search engine verification. Admins only." />
      <Card className="max-w-2xl">
        <SettingsForm settings={settings} />
      </Card>
    </div>
  );
}
