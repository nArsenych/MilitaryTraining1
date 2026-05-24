import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getOrganizationStatus() {
  const session = await getSession();

  if (!session) {
    return false;
  }

  const orgProfile = await db.organizationProfile.findUnique({
    where: { user_id: session.userId },
    select: { id: true },
  });

  return !!orgProfile;
}
