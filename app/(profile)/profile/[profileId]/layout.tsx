import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const ProfileDetailsLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ profileId: string }>;
}) => {
  const { profileId } = await params;

  // Try clientProfile first, then organizationProfile
  const clientProfile = await db.clientProfile.findUnique({
    where: { id: profileId },
  });

  if (!clientProfile) {
    const orgProfile = await db.organizationProfile.findUnique({
      where: { id: profileId },
    });
    if (!orgProfile) {
      return redirect("/");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 bg-[#302E2B] min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default ProfileDetailsLayout;
