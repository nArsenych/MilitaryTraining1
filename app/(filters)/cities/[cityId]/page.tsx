import getCoursesByCity from "@/app/actions/getCoursesCities";
import CourseCard from "@/components/courses/CourseCard";
import Cities from "@/components/custom/Cities";
import { db } from "@/lib/db";

const CoursesByCity = async ({
  params,
}: {
  params: { cityId: string };
}) => {
  const cities = await db.city.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const courses = await getCoursesByCity(params.cityId);

  return (
    <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
      <Cities cities={cities} />
      <div className="flex flex-wrap gap-7 justify-center">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
    </div>
  );
};

export default CoursesByCity;