"use server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { type ActionState, zodFieldErrors } from "@/lib/cms/action-state";
import { CMS_TAGS, invalidate } from "@/lib/cms/tags";
import type { SiteSettings } from "@/lib/cms/types";

/** If someone pastes a whole `<meta name="..." content="TOKEN">` tag, keep just the token. */
function extractVerificationToken(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/content=["']([^"']+)["']/i);
  return (match ? match[1] : trimmed).trim();
}

const settingsSchema = z.object({
  seoTitleDefault: z.string().trim().max(70).optional(),
  seoDescriptionDefault: z.string().trim().max(200).optional(),
  defaultOgImageUrl: z.string().trim().max(2000).optional(),
  googleSiteVerification: z
    .string()
    .trim()
    .transform(extractVerificationToken)
    .optional(),
  bingSiteVerification: z
    .string()
    .trim()
    .transform(extractVerificationToken)
    .optional(),
  ga4MeasurementId: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((v) => !v || /^G-[A-Z0-9]+$/.test(v), "Should look like G-XXXXXXXXXX."),
  blogTitle: z.string().trim().max(120).optional(),
  blogIntro: z.string().trim().max(500).optional(),
  blogMetaTitle: z.string().trim().max(70).optional(),
  blogMetaDescription: z.string().trim().max(200).optional(),
});

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const raw = Object.fromEntries(
    (
      [
        "seoTitleDefault",
        "seoDescriptionDefault",
        "defaultOgImageUrl",
        "googleSiteVerification",
        "bingSiteVerification",
        "ga4MeasurementId",
        "blogTitle",
        "blogIntro",
        "blogMetaTitle",
        "blogMetaDescription",
      ] as const
    ).map((key) => [key, (formData.get(key) as string) ?? ""]),
  );
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Check the fields below.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }

  const value: SiteSettings = {};
  for (const [key, v] of Object.entries(parsed.data)) {
    if (v) value[key as keyof SiteSettings] = v;
  }

  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key: "site", value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });

  invalidate(CMS_TAGS.settings);

  return { ok: true, message: "Settings saved." };
}
