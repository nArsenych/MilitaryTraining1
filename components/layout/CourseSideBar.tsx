import { db } from "@/lib/db";
import { Course } from "@prisma/client";
import Link from "next/link";
import { EnrollButton } from "@/components/custom/EnrollButton";
import { Home, Info, LogIn, CheckCircle2, CalendarX } from "lucide-react";

interface CourseSideBarProps {
  course: Course;
  studentId: string | null;
}

const CourseSideBar = async ({ course, studentId }: CourseSideBarProps) => {
  const isPastStart = course.startDate ? new Date(course.startDate) < new Date() : false;
  let clientProfile = null;
  let existingPurchase = null;

  if (studentId) {
    clientProfile = await db.clientProfile.findUnique({ where: { user_id: studentId } });
    if (clientProfile) {
      existingPurchase = await db.purchase.findUnique({
        where: { customerId_courseId: { customerId: clientProfile.id, courseId: course.id } },
      });
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#272523] border-r border-white/10 px-3 pt-6 pb-4">
      {/* course chip */}
      <div className="mx-2 mb-4 px-3 py-2.5 rounded-xl bg-[#FDAB04]/10 border border-[#FDAB04]/20">
        <p className="text-[10px] text-[#FDAB04]/50 uppercase tracking-wider">Курс</p>
        <p className="text-sm font-semibold text-[#FDAB04] line-clamp-2 leading-snug mt-0.5">
          {course.title}
        </p>
      </div>

      <nav className="flex flex-col gap-0.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all"
        >
          <Home size={16} className="text-white/40" />
          Головна
        </Link>
        <Link
          href={`/courses/${course.id}/overview`}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all"
        >
          <Info size={16} className="text-white/40" />
          Інформація про курс
        </Link>
      </nav>

      <div className="my-3 mx-2 border-t border-white/10" />

      {/* enroll area */}
      {!studentId && (
        <Link
          href={`/sign-in?redirect=/courses/${course.id}/overview`}
          className="flex items-center justify-center gap-2 mx-2 px-4 py-2 rounded-lg bg-[#FDAB04] hover:bg-[#ebac66] text-black text-sm font-semibold transition-colors"
        >
          <LogIn size={15} />
          Увійти щоб записатися
        </Link>
      )}

      {studentId && clientProfile && !existingPurchase && (
        isPastStart ? (
          <div className="mx-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 text-sm">
            <CalendarX size={14} className="shrink-0" />
            Запис закрито
          </div>
        ) : (
          <div className="mx-2">
            <EnrollButton
              courseId={course.id}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-[#FDAB04] hover:bg-[#ebac66] text-black text-sm font-semibold transition-colors"
            />
          </div>
        )
      )}

      {existingPurchase && (
        <div className="mx-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
          <CheckCircle2 size={15} className="shrink-0" />
          Ви записані
        </div>
      )}
    </aside>
  );
};

export default CourseSideBar;
