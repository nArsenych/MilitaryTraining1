import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const { isOrganization } = await req.json();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingProfile = await db.profile.findFirst({
      where: {
        user_id: session.userId,
      }
    });

    if (existingProfile) {
      const updatedProfile = await db.profile.update({
        where: {
          id: existingProfile.id
        },
        data: {
          isOrganization
        }
      });
      return NextResponse.json(updatedProfile);
    }

    const newProfile = await db.profile.create({
      data: {
        user_id: session.userId,
        isOrganization
      }
    });

    return NextResponse.json(newProfile);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
