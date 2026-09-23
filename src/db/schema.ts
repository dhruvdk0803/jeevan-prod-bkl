import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * CMS schema — the single source of truth for blog, media, SEO and admin data.
 *
 * Change this file, then run `npm run db:generate` to emit a migration into
 * `drizzle/`. Migrations are applied by `npm run db:migrate` (production
 * Postgres) and automatically on first connection in local PGlite dev.
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/* ------------------------------------------------------------------ auth */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(), // always stored lower-cased
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** `admin` manages users + settings; `editor` writes and publishes content. */
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  /** Public byline bio, shown on posts and used in Person schema. */
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the random token held in the cookie — never the raw token. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Login throttling: failed attempts keyed by `email:<addr>` and `ip:<addr>`. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_key_idx").on(t.key, t.createdAt)],
);

/* --------------------------------------------------------------- content */

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ...timestamps,
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    /** Sanitised HTML rendered on the public site. */
    content: text("content").notNull().default(""),
    /** Tiptap document JSON — the editor's source of truth. */
    contentJson: jsonb("content_json"),
    coverImageUrl: text("cover_image_url"),
    coverImageAlt: text("cover_image_alt"),
    coverImageWidth: integer("cover_image_width"),
    coverImageHeight: integer("cover_image_height"),
    /**
     * `published` + `publishedAt` in the future = scheduled. Public queries
     * always filter on `status = 'published' AND published_at <= now()`.
     */
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    /* ---- SEO ---- */
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    focusKeyword: text("focus_keyword"),
    canonicalUrl: text("canonical_url"),
    ogImageUrl: text("og_image_url"),
    noindex: boolean("noindex").notNull().default(false),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    ...timestamps,
  },
  (t) => [
    index("posts_status_published_idx").on(t.status, t.publishedAt),
    index("posts_category_idx").on(t.categoryId),
  ],
);

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] }), index("post_tags_tag_idx").on(t.tagId)],
);

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  /** Storage key (Vercel Blob pathname, or path under /public/uploads in dev). */
  pathname: text("pathname").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull().default(""),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------- SEO */

/** Per-route overrides for the static marketing pages (`/`, `/about`, …). */
export const pageSeo = pgTable("page_seo", {
  path: text("path").primaryKey(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImageUrl: text("og_image_url"),
  noindex: boolean("noindex").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const redirects = pgTable("redirects", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Path only, starting with "/", no trailing slash (except "/"), no query. */
  source: text("source").notNull().unique(),
  /** Internal path or absolute URL. */
  destination: text("destination").notNull(),
  permanent: boolean("permanent").notNull().default(true),
  ...timestamps,
});

/** Key/value store. The `site` key holds `SiteSettings` (see lib/cms/types.ts). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Media = typeof media.$inferSelect;
export type PageSeo = typeof pageSeo.$inferSelect;
export type Redirect = typeof redirects.$inferSelect;
