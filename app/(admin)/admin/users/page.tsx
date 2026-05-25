import { db } from "@/lib/db";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export const dynamic = "force-dynamic";

const AdminUsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) => {
  const { search = "", page = "1" } = await searchParams;
  const take = 20;
  const skip = (parseInt(page, 10) - 1) * take;

  const where = search
    ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
    : undefined;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        blockExpiry: true,
        createdAt: true,
        _count: { select: { warnings: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Користувачі</h1>
        <p className="text-white/40 text-sm mt-1">Управління акаунтами ({total})</p>
      </div>
      <AdminUsersTable
        users={users.map((u) => ({
          ...u,
          blockExpiry: u.blockExpiry?.toISOString() ?? null,
          createdAt: u.createdAt.toISOString(),
        }))}
        total={total}
        page={parseInt(page, 10)}
        search={search}
      />
    </div>
  );
};

export default AdminUsersPage;
