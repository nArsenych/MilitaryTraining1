import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getOrganizationStatus() {
  const session = await getSession();
  
  if (!session) {
    return false;
  }

  const profile = await db.profile.findUnique({
    where: {
      user_id: session.userId
    },
    select: {
      isOrganization: true
    }
  });

  return profile?.isOrganization || false;
}
