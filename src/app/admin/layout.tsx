import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  const user = db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, session.userId!) }).sync();

  if (!user?.isAdmin) {
    // Show 404 to non-admins
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return <AdminShell>{children}</AdminShell>;
}
