import { db } from "@/lib/db";
import CourseCard from "@/components/courses/CourseCard";
import Organizations from "@/components/custom/Organizations"; 
import getCoursesByOrganization from "../../actions/getCoursesOrganizations"; 

export default async function OrganizationsPage() {
  const allCourses = await db.course.findMany({
    where: {
      isPublished: true
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const courses = await getCoursesByOrganization(null);

  return (
    <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
      <Organizations courses={allCourses} selectedOrganization={null} />
      {courses.length > 0 && (
        <div className="flex flex-wrap gap-7 justify-center">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}