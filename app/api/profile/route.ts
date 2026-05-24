import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const { isOrganization, edrpou } = await req.json();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (isOrganization) {
      // Check if org profile already exists
      const existingOrg = await db.organizationProfile.findUnique({
        where: { user_id: session.userId },
      });

      if (existingOrg) {
        return NextResponse.json(existingOrg);
      }

      // Remove any existing client profile first (switching type)
      await db.clientProfile.deleteMany({ where: { user_id: session.userId } });

      const newOrgProfile = await db.organizationProfile.create({
        data: {
          user_id: session.userId,
          ...(edrpou ? { edrpou } : {}),
        },
      });
      return NextResponse.json(newOrgProfile);
    } else {
      // Check if client profile already exists
      const existingClient = await db.clientProfile.findUnique({
        where: { user_id: session.userId },
      });

      if (existingClient) {
        return NextResponse.json(existingClient);
      }

      // Remove any existing org profile first (switching type)
      await db.organizationProfile.deleteMany({ where: { user_id: session.userId } });

      const newClientProfile = await db.clientProfile.create({
        data: {
          user_id: session.userId,
        },
      });
      return NextResponse.json(newClientProfile);
    }
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
