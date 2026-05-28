import { db } from "@/lib/db";
import AdminCoursesTable from "@/components/admin/AdminCoursesTable";

export const dynamic = "force-dynamic";

const AdminCoursesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) => {
  const { search = "", page = "1" } = await searchParams;
  const take = 20;
  const skip = (Number.parseInt(page, 10) - 1) * take;

  const where = search ? { title: { contains: search } } : undefined;

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        isPublished: true,
        createdAt: true,
        organization: { select: { full_name: true, user: { select: { email: true } } } },
        _count: { select: { complaints: true, reviews: true } },
      },
    }),
    db.course.count({ where }),
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Курси</h1>
        <p className="text-white/40 text-sm mt-1">Управління курсами ({total})</p>
      </div>
      <AdminCoursesTable
        courses={courses.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
        total={total}
        page={Number.parseInt(page, 10)}
        search={search}
      />
    </div>
  );
};

export default AdminCoursesPage;
