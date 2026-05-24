import CourseSideBar from "@/components/layout/CourseSideBar";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const CourseDetailsLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;
  const session = await getSession();

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    const { redirect } = await import("next/navigation");
    return redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      <CourseSideBar course={course} studentId={session?.userId || null} />
      <div className="flex-1 bg-[#302E2B]">{children}</div>
    </div>
  );
};

export default CourseDetailsLayout;