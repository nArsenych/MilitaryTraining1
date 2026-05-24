import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      full_name,
      phone_number,
      contact_email,
      instagram,
      telegram,
      facebook,
      description,
      address,
      age,
      isMilitary,
    } = await req.json();

    // Determine which profile type this user has
    const existingOrg = await db.organizationProfile.findUnique({
      where: { user_id: session.userId },
    });

    if (existingOrg) {
      // Upsert organization profile (edrpou excluded — set once at creation)
      const profile = await db.organizationProfile.upsert({
        where: { user_id: session.userId },
        create: {
          full_name,
          phone_number,
          contact_email,
          instagram,
          telegram,
          facebook,
          description,
          address,
          user_id: session.userId,
        },
        update: {
          full_name,
          phone_number,
          contact_email,
          instagram,
          telegram,
          facebook,
          description,
          address,
        },
      });
      return NextResponse.json(profile, { status: 200 });
    }

    // Default: upsert client profile
    const profile = await db.clientProfile.upsert({
      where: { user_id: session.userId },
      create: {
        full_name,
        phone_number,
        instagram,
        telegram,
        facebook,
        description,
        age,
        isMilitary,
        user_id: session.userId,
      },
      update: {
        full_name,
        phone_number,
        instagram,
        telegram,
        facebook,
        description,
        age,
        isMilitary,
      },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    console.log("[profiles_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
