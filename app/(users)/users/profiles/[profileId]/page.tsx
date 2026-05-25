import { getOrganizationStatus } from "@/components/NavbarRoutes";
import EditProfileForm from "@/components/profiles/EditProfileForm";
import { db } from "@/lib/db";
import { getSession, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { profileId: string };
}

const ProfileBasics = async ({ params }: { params: Promise<{ profileId: string }> }) => {
  const { profileId } = await params;
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const user = await getUserById(session.userId);

  // Try organizationProfile first (to route correctly on not-found)
  const orgProfile = await db.organizationProfile.findUnique({
    where: { id: profileId, user_id: session.userId },
  });

  if (orgProfile) {
    return (
      <div className="px-4 md:px-10">
        <EditProfileForm profile={orgProfile} isOrganization={true} userEmail={user?.email || ""} />
      </div>
    );
  }

  const clientProfile = await db.clientProfile.findUnique({
    where: { id: profileId, user_id: session.userId },
  });

  if (!clientProfile) {
    return redirect("/instructor/courses");
  }

  const isOrganization = await getOrganizationStatus();
  return (
    <div className="px-4 md:px-10">
      <EditProfileForm profile={clientProfile} isOrganization={isOrganization} userEmail={user?.email || ""} />
    </div>
  );
};

export default ProfileBasics;
