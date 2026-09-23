import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { Badge, ButtonLink, EmptyState, PageHeader, Table, Td, Th, formatDate } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  await requireAdmin();
  const db = await getDb();
  const users = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      lastLoginAt: schema.users.lastLoginAt,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt));

  return (
    <div>
      <PageHeader
        title="Users"
        description="People who can sign in to the admin."
        actions={<ButtonLink href="/admin/users/new" variant="primary">Invite user</ButtonLink>}
      />

      {users.length === 0 ? (
        <EmptyState title="No users yet" description="This shouldn't happen — at least one admin must exist." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Last sign-in</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <Td className="font-medium">
                  <Link href={`/admin/users/${u.id}`} className="hover:text-ember">
                    {u.name}
                  </Link>
                </Td>
                <Td className="text-neutral">{u.email}</Td>
                <Td>
                  <Badge tone={u.role === "admin" ? "info" : "neutral"}>{u.role}</Badge>
                </Td>
                <Td className="text-neutral">{formatDate(u.lastLoginAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
