
import CourseCard from "@/components/courses/CourseCard";
import getCoursesByOrganization from "@/app/actions/getCoursesOrganizations";
import Organization from "@/components/custom/Organizations";
  
export const dynamic = "force-dynamic";

  const CoursesByOrg = async ({
    params,
  }: {
    params: Promise<{ organizationId: string }>;
  }) => {
    const courses = await getCoursesByOrganization(null);
    const { organizationId } = await params; 
    return (
      <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
        <Organization 
          courses={courses} 
          selectedOrganization={organizationId} 
        />
        <div className="flex flex-wrap gap-7 justify-center">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    );
  };
  
  export default CoursesByOrg;