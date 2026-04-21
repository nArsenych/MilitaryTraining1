import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { full_name, phone_number } = await req.json();

    const profile = await db.profile.upsert({
      where: {
        user_id: session.userId,
      },
      create: {
        full_name,
        phone_number,
        user_id: session.userId
      },
      update: {
        full_name,
        phone_number,
      }
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    console.log("[profiles_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
