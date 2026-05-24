import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Tag, Users } from "lucide-react";
import DeleteEnrollmentButton from "@/components/courses/DeleteEnrollmentButton";

export const dynamic = "force-dynamic";

const PendingCourses = async () => {
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
      confirmed: false,
      course: {
        endDate: { gt: now },
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#FDAB04]">
        Очікують підтвердження ({purchases.length})
      </h2>

      {purchases.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg mb-4">Немає курсів, що очікують підтвердження.</p>
          <Link
            href="/all"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FDAB04]/15 border border-[#FDAB04]/30 text-[#FDAB04] text-sm hover:bg-[#FDAB04]/25 transition-colors"
          >
            Переглянути доступні курси
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {purchases.map((purchase) => {
            const course = purchase.course;
            return (
              <div
                key={purchase.id}
                className="w-full max-w-sm rounded-2xl bg-[#3D3A36] border border-white/8 overflow-hidden flex flex-col"
              >
                {/* top */}
                <div className="px-5 py-4 border-b border-white/8">
                  <Link
                    href={`/courses/${course.id}/overview`}
                    className="text-base font-semibold text-white hover:text-[#FDAB04] transition-colors line-clamp-2"
                  >
                    {course.title}
                  </Link>
                  {course.organization && (
                    <p className="text-xs text-white/40 mt-1">{course.organization.full_name}</p>
                  )}
                </div>

                {/* meta */}
                <div className="px-5 py-3 flex flex-wrap gap-2">
                  {course.category && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-white/60">
                      <Tag size={11} className="text-[#FDAB04]" />
                      {course.category.name}
                    </span>
                  )}
                  {course.city && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-white/60">
                      <MapPin size={11} className="text-[#FDAB04]" />
                      {course.city.name}
                    </span>
                  )}
                  {course.level && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-white/60">
                      <Users size={11} className="text-[#FDAB04]" />
                      {course.level.name}
                    </span>
                  )}
                </div>

                {/* dates */}
                <div className="px-5 py-3 flex items-center justify-between border-t border-white/8 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Calendar size={12} className="text-[#FDAB04]" />
                    <span>
                      {course.startDate?.toLocaleDateString("uk-UA")} — {course.endDate?.toLocaleDateString("uk-UA")}
                    </span>
                  </div>
                  {course.price !== null && (
                    <span className="text-sm font-semibold text-[#FDAB04]">{course.price} грн</span>
                  )}
                </div>

                {/* status + cancel */}
                <div className="px-5 pb-4 flex items-center justify-between">
                  <span className="text-xs text-[#ebac66] font-medium">Очікує підтвердження ⏳</span>
                  <DeleteEnrollmentButton courseId={course.id} courseTitle={course.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingCourses;
