import { db } from "@/lib/db";
import getCoursesByCategory from "../../actions/getCoursesCategories";
import Categories from "@/components/custom/Categories";
import CourseCard from "@/components/courses/CourseCard";

export default async function Categoriess() {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const courses = await getCoursesByCategory(null);
  return (
    <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
      <Categories categories={categories} selectedCategory={null} />
      <div className="flex flex-wrap gap-7 justify-center">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
    </div>
  );
}
