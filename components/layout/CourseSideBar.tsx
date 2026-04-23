import { db } from "@/lib/db";
import { Course } from "@prisma/client";
import Link from "next/link";
import { EnrollButton } from "@/components/custom/EnrollButton";

interface CourseSideBarProps {
  course: Course;
  studentId: string | null;
}

const CourseSideBar = async ({ course, studentId }: CourseSideBarProps) => {
  let userProfile = null;
  let existingPurchase = null;

  if (studentId) {
    userProfile = await db.profile.findUnique({
      where: { user_id: studentId },
    });

    if (userProfile) {
      existingPurchase = await db.purchase.findUnique({
        where: {
          customerId_courseId: {
            customerId: userProfile.id,
            courseId: course.id,
          },
        },
      });
    }
  }

  return (
    <div className="hidden md:flex flex-col w-64 border-r shadow-md px-3 text-sm font-medium bg-[#4E4C4B] pt-4">
      <h1 className="text-lg font-bold text-center mb-4 text-[#ebac66]">
        {course.title}
      </h1>

      <Link href="/" className="p-3 rounded-lg hover:bg-[#ebac66] mt-4">
        Home
      </Link>
      <Link
        href={`/courses/${course.id}/overview`}
        className="p-3 rounded-lg hover:bg-[#ebac66] mt-4"
      >
        Інформація про курс
      </Link>

      {/* Не авторизований — кнопка "Увійти щоб записатися" */}
      {!studentId && (
        <Link
          href={`/sign-in?redirect=/courses/${course.id}/overview`}
          className="mt-4 p-3 rounded-lg bg-[#ebac66] hover:bg-[#d99b55] text-center text-black font-medium"
        >
          Увійти щоб записатися
        </Link>
      )}

      {/* Авторизований клієнт, ще не записаний */}
      {studentId && userProfile && !userProfile.isOrganization && !existingPurchase && (
        <EnrollButton
          courseId={course.id}
          studentId={studentId}
          className="mt-4 p-3 rounded-lg bg-[#ebac66] hover:bg-[#d99b55] text-center"
        />
      )}

      {/* Вже записаний */}
      {existingPurchase && (
        <p className="mt-4 p-3 rounded-lg bg-green-100 text-center text-green-800 font-medium">
          Ви записані на цей курс ✓
        </p>
      )}
    </div>
  );
};

export default CourseSideBar;