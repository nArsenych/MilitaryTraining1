import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const HistoryCourses = async () => {
  const session = await getSession();
  if (!session) return redirect("/sign-in");

  const profile = await db.profile.findUnique({
    where: { user_id: session.userId },
  });
  if (!profile) return redirect("/select-type");

  const now = new Date();

  const purchases = await db.purchase.findMany({
    where: {
      customerId: profile.id,
      course: {
        startDate: { lte: now },
      },
    },
    include: {
      course: {
        include: {
          category: true,
          city: true,
          level: true,
          organization: true,
        },
      },
    },
    orderBy: { course: { startDate: "desc" } },
  });

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-600">
        Історія курсів ({purchases.length})
      </h2>
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Історія порожня.</p>
          <Link href="/all" className="text-[#ebac66] hover:underline mt-4 inline-block">
            Переглянути доступні курси
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {purchases.map((purchase) => (
            <Link
              key={purchase.id}
              href={`/courses/${purchase.course.id}/overview`}
              className="block border rounded-lg p-5 bg-[#FFF8EE] hover:bg-[#F1CDA6] transition h-fit"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{purchase.course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Організація: {purchase.course.organization?.full_name || "Невідомо"}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {purchase.course.category && <span>{purchase.course.category.name}</span>}
                    {purchase.course.city && <span>{purchase.course.city.name}</span>}
                    {purchase.course.level && <span>{purchase.course.level.name}</span>}
                  </div>
                </div>
                <div className="text-right text-sm">
                  {purchase.confirmed ? (
                    <p className="text-green-700 font-medium">Був підтверджений ✓</p>
                  ) : (
                    <p className="text-gray-400">Не був підтверджений</p>
                  )}
                  <p className="text-gray-500 mt-1">
                    Початок: {purchase.course.startDate?.toLocaleDateString("uk-UA")}
                  </p>
                  <p className="text-gray-500">
                    Кінець: {purchase.course.endDate?.toLocaleDateString("uk-UA")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryCourses;