import { db } from "@/lib/db";
import AdminComplaintsTable from "@/components/admin/AdminComplaintsTable";

export const dynamic = "force-dynamic";

const AdminComplaintsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) => {
  const { status = "PENDING", type } = await searchParams;
  const statusFilter = status as "PENDING" | "RESOLVED" | "DISMISSED";

  const [courseComplaints, commentComplaints, orgComplaints] = await Promise.all([
    type && type !== "course"
      ? []
      : db.courseComplaint.findMany({
          where: { status: statusFilter },
          include: {
            course: { select: { id: true, title: true } },
            user: { select: { id: true, email: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
    type && type !== "comment"
      ? []
      : db.commentComplaint.findMany({
          where: { status: statusFilter },
          include: {
            review: { select: { id: true, comment: true, rating: true } },
            organization: { select: { id: true, full_name: true, user: { select: { email: true } } } },
          },
          orderBy: { createdAt: "desc" },
        }),
    type && type !== "organization"
      ? []
      : db.organizationComplaint.findMany({
          where: { status: statusFilter },
          include: {
            organization: { select: { id: true, full_name: true, user: { select: { email: true } } } },
            user: { select: { id: true, email: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
  ]);

  const all = [
    ...courseComplaints.map((c) => ({ ...c, type: "course" as const, createdAt: c.createdAt.toISOString() })),
    ...commentComplaints.map((c) => ({ ...c, type: "comment" as const, createdAt: c.createdAt.toISOString() })),
    ...orgComplaints.map((c) => ({ ...c, type: "organization" as const, createdAt: c.createdAt.toISOString() })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Скарги</h1>
        <p className="text-white/40 text-sm mt-1">Розгляд скарг від користувачів та організацій</p>
      </div>
      <AdminComplaintsTable complaints={all} status={status} type={type || ""} />
    </div>
  );
};

export default AdminComplaintsPage;
