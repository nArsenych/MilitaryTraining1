import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import CourseActions from "@/components/courses/CourseActions";
import { BookOpen, Users, Calendar, History, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const CoursesPage = async () => {
  const session = await getSession();
  if (!session) return redirect("/sign-in");

  const orgProfile = await db.organizationProfile.findUnique({ where: { user_id: session.userId } });
  if (!orgProfile) return redirect("/select-type");

  const courses = await db.course.findMany({
    where: { organizationId: orgProfile.id },
    include: {
      category: true,
      city: true,
      level: true,
      runs: { orderBy: { startDate: "desc" } },
      _count: { select: { purchases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const fmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Ваші курси</h1>
        <Link href="/instructor/create-course">
          <Button className="bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold">
            Створити курс
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-white/40 text-center py-16">У вас ще немає курсів.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {courses.map((course) => (
            <div key={course.id} className="rounded-2xl bg-[#3D3A36] border border-white/10 overflow-hidden">

              <div className="flex items-start justify-between px-5 py-4 border-b border-white/10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                      href={`/instructor/courses/${course.id}/basic`}
                      className="font-semibold text-white hover:text-[#FDAB04] transition-colors"
                    >
                      {course.title}
                    </Link>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      course.isPublished
                        ? "bg-green-500/15 text-green-400 border-green-500/20"
                        : "bg-white/8 text-white/40 border-white/10"
                    }`}>
                      {course.isPublished ? "Опубліковано" : "Чернетка"}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    {course.category?.name}
                    {course.city && ` · ${course.city.name}`}
                    {course.level && ` · ${course.level.name}`}
                  </p>
                </div>
                <div className="shrink-0 ml-4">
                  <CourseActions courseId={course.id} courseTitle={course.title} courseEndDate={course.endDate} />
                </div>
              </div>

              <div className="flex items-center gap-6 px-5 py-3 border-b border-white/8">
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <Users size={12} className="text-[#FDAB04]" />
                  {course._count.purchases} записаних
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <Calendar size={12} className="text-[#FDAB04]" />
                  {fmt(course.startDate)} — {fmt(course.endDate)}
                </span>
                {course.price !== null && (
                  <span className="flex items-center gap-1.5 text-xs text-white/50">
                    <BookOpen size={12} className="text-[#FDAB04]" />
                    {course.price > 0 ? `${course.price} грн` : "Безкоштовно"}
                  </span>
                )}
              </div>

              {course.runs.length > 0 && (
                <div className="px-5 py-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                    <History size={11} />
                    Попередні проведення
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {course.runs.map((run) => (
                      <span
                        key={run.id}
                        className="inline-flex items-center gap-1.5 text-xs text-white/45 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg"
                      >
                        <CheckCircle2 size={10} className="text-green-400/70 shrink-0" />
                        {fmt(run.startDate)} — {fmt(run.endDate)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
