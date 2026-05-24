import CalendarCourses from "@/components/courses/CalendarCourse";
import ThreeIcon from "@/components/layout/ThreeIcon";
import { db } from "@/lib/db";
import { getRecommendedCourses } from "@/app/actions/getRecommendations";
import RecommendedCourses from "@/components/courses/RecommendedCourses";

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
  const { courses: recommendedCourses, type: recommendationType } = await getRecommendedCourses();

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
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-12">
        <section>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Огляд</p>
          <ThreeIcon />
        </section>

        <section>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Розклад</p>
          <CalendarCourses courses={coursesWithOrganization} />
        </section>

        <RecommendedCourses courses={recommendedCourses} type={recommendationType} />
      </div>
    </div>
  );
}
