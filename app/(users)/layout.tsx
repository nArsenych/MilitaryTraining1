import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileSidebar from "@/components/layout/ProfileSideBar";
import { db } from "@/lib/db";

const Instructorlayout = async ({children}: {children: React.ReactNode}) => {
    const session = await getSession();
  
    if (!session) {
      return redirect("/sign-in");
    }
  
    const profile = await db.profile.findUnique({
      where: {
        user_id: session.userId,
      },
    });
  
    if (!profile) {
      return redirect("/");
    }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex h-full">
        <ProfileSidebar profile={profile}/>
        <div className="flex-1 bg-[#4E4C4B] min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default Instructorlayout;