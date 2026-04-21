
import CourseCard from "@/components/courses/CourseCard";
import getCoursesByOrganization from "@/app/actions/getCoursesOrganizations";
import Organization from "@/components/custom/Organizations";
  
  const CoursesByOrg = async ({
    params,
  }: {
    params: { organizationId: string };
  }) => {
    const courses = await getCoursesByOrganization(null);
    
    return (
      <div className="md:px-10 xl:px-16 pb-16 bg-[#4E4C4B] min-h-screen pt-5">
        <Organization 
          courses={courses} 
          selectedOrganization={params.organizationId} 
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