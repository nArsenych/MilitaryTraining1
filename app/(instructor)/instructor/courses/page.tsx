import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import CourseActions from "@/components/courses/CourseActions";

export const dynamic = "force-dynamic";

const CoursesPage = async () => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: { user_id: session.userId },
  });

  if (!profile) {
    return redirect("/select-type");
  }

  const courses = await db.course.findMany({
    where: { organizationId: profile.id },
    include: {
      category: true,
      city: true,
      level: true,
      parentCourse: { select: { id: true, title: true, startDate: true, endDate: true } },
      repeatedCourses: {
        select: { id: true, startDate: true, endDate: true, isPublished: true },
        orderBy: { startDate: "desc" },
      },
      _count: { select: { purchases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#ebac66]">Ваші курси</h1>
        <Link href="/instructor/create-course">
          <Button>Створити курс</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-400 text-center py-12">У вас ще немає курсів.</p>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 bg-[#F1CDA6]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    href={`/instructor/courses/${course.id}/basic`}
                    className="text-lg font-semibold hover:text-[#ebac66] transition"
                  >
                    {course.title}
                  </Link>

                  <div className="flex gap-3 mt-1 text-sm text-gray-600">
                    {course.category && <span>{course.category.name}</span>}
                    {course.city && <span>{course.city.name}</span>}
                    {course.level && <span>{course.level.name}</span>}
                  </div>

                  <div className="flex gap-4 mt-2 text-sm">
                    {course.startDate && (
                      <span>Початок: {course.startDate.toLocaleDateString("uk-UA")}</span>
                    )}
                    {course.endDate && (
                      <span>Кінець: {course.endDate.toLocaleDateString("uk-UA")}</span>
                    )}
                    <span>Записаних: {course._count.purchases}</span>
                  </div>

                  {/* Історія повторів */}
                  {course.repeatedCourses.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-600">Повтори цього курсу:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {course.repeatedCourses.map((repeat) => (
                          <Link
                            key={repeat.id}
                            href={`/instructor/courses/${repeat.id}/basic`}
                            className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50"
                          >
                            {repeat.startDate?.toLocaleDateString("uk-UA")} — {repeat.endDate?.toLocaleDateString("uk-UA")}
                            {repeat.isPublished ? " ✓" : " (чернетка)"}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Якщо це повтор — показати оригінал */}
                  {course.parentCourse && (
                    <p className="text-xs text-gray-500 mt-2">
                      Повтор курсу:{" "}
                      <Link
                        href={`/instructor/courses/${course.parentCourse.id}/basic`}
                        className="underline"
                      >
                        {course.parentCourse.startDate?.toLocaleDateString("uk-UA")} — {course.parentCourse.endDate?.toLocaleDateString("uk-UA")}
                      </Link>
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className={`text-xs px-2 py-1 rounded ${course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {course.isPublished ? "Опубліковано" : "Чернетка"}
                  </span>
                  {course.price !== null && (
                    <span className="text-sm font-medium">{course.price} грн</span>
                  )}
                  <CourseActions courseId={course.id} courseTitle={course.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;