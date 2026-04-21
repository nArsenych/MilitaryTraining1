import { db } from "@/lib/db";
import CourseCard from "@/components/courses/CourseCard";

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    where: {
      isPublished: true
    },
    include: {
      category: true,
      level: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
      <div className="flex flex-wrap gap-7 justify-center">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}