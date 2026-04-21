import { db } from "@/lib/db";
import CourseCard from "@/components/courses/CourseCard";
import getCoursesByCity from "@/app/actions/getCoursesCities";
import Cities from "@/components/custom/Cities";


export default async function Citiess() {
  const cities = await db.city.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const courses = await getCoursesByCity(null);
  return (
    <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
      <Cities cities={cities}/>
      <div className="flex flex-wrap gap-7 justify-center">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
    </div>
  );
}
