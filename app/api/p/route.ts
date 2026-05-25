import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ profileId: null, isOrganization: false, isAdmin: false });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (user?.role === "ADMIN") {
      return NextResponse.json({ profileId: null, isOrganization: false, isAdmin: true });
    }

    const clientProfile = await db.clientProfile.findUnique({
      where: { user_id: session.userId },
      select: { id: true },
    });
    if (clientProfile) {
      return NextResponse.json({ profileId: clientProfile.id, isOrganization: false, isAdmin: false });
    }

    const orgProfile = await db.organizationProfile.findUnique({
      where: { user_id: session.userId },
      select: { id: true },
    });
    if (orgProfile) {
      return NextResponse.json({ profileId: orgProfile.id, isOrganization: true, isAdmin: false });
    }

    return NextResponse.json({ profileId: null, isOrganization: false, isAdmin: false });
  } catch (error) {
    console.log("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
