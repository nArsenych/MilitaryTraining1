import { db } from "@/lib/db";
import { getSession, removeAuthCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) => {
  try {
    const session = await getSession();
    const { profileId } = await params;
    const body = await req.json();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // edrpou is intentionally excluded — it cannot be changed after creation
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
    } = body;

    // Try organization profile first
    const orgProfile = await db.organizationProfile.findUnique({
      where: { id: profileId, user_id: session.userId },
    });

    if (orgProfile) {
      const updated = await db.organizationProfile.update({
        where: { id: profileId, user_id: session.userId },
        data: {
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
      return NextResponse.json(updated, { status: 200 });
    }

    // Fall back to client profile
    const updated = await db.clientProfile.update({
      where: { id: profileId, user_id: session.userId },
      data: {
        full_name,
        phone_number,
        instagram,
        telegram,
        facebook,
        description,
        age,
        isMilitary,
        ...(isMilitary === false ? { isMilitaryVerified: false, militaryVerificationCode: null } : {}),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error(["profileId_PATCH", err]);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) => {
  try {
    const session = await getSession();
    const { profileId } = await params;

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Пароль обов'язковий" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Неправильний пароль" }, { status: 400 });
    }

    // Try organization profile first
    const orgProfile = await db.organizationProfile.findUnique({
      where: { id: profileId, user_id: session.userId },
    });

    if (orgProfile) {
      await db.organizationProfile.delete({ where: { id: profileId, user_id: session.userId } });
      await removeAuthCookie();
      return new NextResponse("Profile Deleted", { status: 200 });
    }

    // Fall back to client profile
    const clientProfile = await db.clientProfile.findUnique({
      where: { id: profileId, user_id: session.userId },
    });

    if (!clientProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    await db.clientProfile.delete({ where: { id: profileId, user_id: session.userId } });
    await removeAuthCookie();

    return new NextResponse("Profile Deleted", { status: 200 });
  } catch (err) {
    console.error(["profileId_DELETE", err]);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
