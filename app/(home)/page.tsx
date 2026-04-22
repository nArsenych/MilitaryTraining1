import CalendarCourses from "@/components/courses/CalendarCourse";
import ThreeIcon from "@/components/layout/ThreeIcon";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getOrganizationName(organizationId: string) {
  const profile = await db.profile.findUnique({
    where: {
      id: organizationId,
    },
  });
  
  return profile?.full_name || "Невідома організація";
}

export default async function Home() {
  const courses = await db.course.findMany({
    where: {
      isPublished: true
    },
    include: {
      category: {
        select: {
          name: true
        }
      }
    }
  });

  const coursesWithOrganization = await Promise.all(
    courses.map(async (course) => ({
      ...course,
      organizationName: await getOrganizationName(course.organizationId)
    }))
  );

  return (
    <div className="min-h-screen w-full bg-[#302E2B]">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mt-12 px-8">
          <ThreeIcon />
        </div>
        <div className="mt-9">
          <CalendarCourses courses={coursesWithOrganization} />
        </div>
      </div>
    </div>
  );
}
