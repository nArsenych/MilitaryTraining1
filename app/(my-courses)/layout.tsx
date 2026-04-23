import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import MyCoursesSideBar from "@/components/layout/MyCoursesSideBar";

const MyCoursesLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: { user_id: session.userId },
  });

  if (!profile) {
    return redirect("/select-type");
  }

  if (profile.isOrganization) {
    return redirect("/instructor/courses");
  }

  return (
    <div className="h-screen flex">
      <MyCoursesSideBar />
      <div className="flex-1 overflow-y-auto bg-[#4E4C4B]">{children}</div>
    </div>
  );
};

export default MyCoursesLayout;