import CourseSideBar from "@/components/layout/CourseSideBar";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const CourseDetailsLayout = async ({children, params,}: {children: React.ReactNode; params: { courseId: string };}) => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
  });

  if (!course) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <CourseSideBar course={course} studentId={session.userId} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default CourseDetailsLayout;
