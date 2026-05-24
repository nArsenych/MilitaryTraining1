import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileSidebar from "@/components/layout/ProfileSideBar";
import { db } from "@/lib/db";

const Instructorlayout = async ({children}: {children: React.ReactNode}) => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  // Try clientProfile first, then organizationProfile
  const clientProfile = await db.clientProfile.findUnique({
    where: { user_id: session.userId },
  });

  if (clientProfile) {
    return (
      <div className="min-h-screen flex">
        <ProfileSidebar profile={clientProfile} isOrganization={false} />
        <div className="flex-1 bg-[#4E4C4B]">{children}</div>
      </div>
    );
  }

  const orgProfile = await db.organizationProfile.findUnique({
    where: { user_id: session.userId },
  });

  if (!orgProfile) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      <ProfileSidebar profile={orgProfile} isOrganization={true} />
      <div className="flex-1 bg-[#4E4C4B]">{children}</div>
    </div>
  );
};

export default Instructorlayout;
