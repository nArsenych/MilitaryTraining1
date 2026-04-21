import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { profileId: string } }
) => {
  try {
    const session = await getSession();
    const { profileId } = params;
    const values = await req.json();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const profile = await db.profile.update({
      where: { id: profileId, user_id: session.userId },
      data: { ...values },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    console.error(["profileId_PATCH", err]);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { profileId: string } }
) => {
  try {
    const session = await getSession();
    const { profileId } = params;

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { id: profileId, user_id: session.userId }
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    await db.profile.delete({
      where: { id: profileId, user_id: session.userId },
    });

    return new NextResponse("Profile Deleted", { status: 200 });
  } catch (err) {
    console.error(["profileId_DELETE", err]);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
