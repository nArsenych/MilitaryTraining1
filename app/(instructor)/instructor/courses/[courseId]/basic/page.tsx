import EditCourseForm from "@/components/courses/EditCourseForm";
import AlertBanner from "@/components/custom/AlertBaner";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

const CourseBasics = async ({ params }: PageProps) => {
  const { courseId } = await params; 
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

  const [course, categories, level, city] = await Promise.all([
    db.course.findUnique({
      where: {
        id: courseId,
        organizationId: profile.id,
      },
    }),
    db.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    db.level.findMany(),
    db.city.findMany()
  ]);

  if (!course) {
    return redirect("/instructor/courses");
  }

  const requiredFields = [
    course.title,
    course.categoryId,
    course.cityId,
    course.levelId,
    course.startAge,
    course.startDate,
    course.endDate,
  ];
  const requiredFieldsCount = requiredFields.length;
  const missingFields = requiredFields.filter((field) => !Boolean(field));
  const missingFieldsCount = missingFields.length;
  const isCompleted = requiredFields.every(Boolean);

  return (
    <div className="px-10">
      <AlertBanner
        isCompleted={isCompleted}
        missingFieldsCount={missingFieldsCount}
        requiredFieldsCount={requiredFieldsCount}
      />
      <EditCourseForm 
        course={course} 
        categories={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        levels={level.map((level) => ({
          label: level.name,
          value: level.id,
        }))}
        cities={city.map((city) => ({
          label: city.name,
          value: city.id,
        }))}
        isCompleted={isCompleted} 
      />
    </div>
  );
};

export default CourseBasics;
