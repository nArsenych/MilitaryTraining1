import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import MyCoursesSideBar from "@/components/layout/MyCoursesSideBar";

const MyCoursesLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  // Only client profiles have access to my-courses
  const clientProfile = await db.clientProfile.findUnique({
    where: { user_id: session.userId },
  });

  if (!clientProfile) {
    // If the user is an organization, redirect to instructor area
    const orgProfile = await db.organizationProfile.findUnique({
      where: { user_id: session.userId },
    });
    if (orgProfile) {
      return redirect("/instructor/courses");
    }
    return redirect("/select-type");
  }

  return (
    <div className="min-h-screen flex">
      <MyCoursesSideBar />
      <div className="flex-1 bg-[#302E2B] pb-16 md:pb-0">{children}</div>
    </div>
  );
};

export default MyCoursesLayout;
