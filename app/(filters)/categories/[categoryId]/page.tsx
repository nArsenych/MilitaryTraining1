import getCoursesByCategory from "@/app/actions/getCoursesCategories";
import CourseCard from "@/components/courses/CourseCard";
import Categories from "@/components/custom/Categories";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CoursesByCategory = async ({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) => {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const { categoryId } = await params; 
  const courses = await getCoursesByCategory(categoryId);

  return (
    <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
      <Categories categories={categories} selectedCategory={categoryId} />
      <div className="flex flex-wrap gap-7 justify-center">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
  
};

export default CoursesByCategory;