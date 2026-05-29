import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMilitaryVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    if (!user.email.endsWith("@mil.gov.ua")) {
      return NextResponse.json({ error: "Верифікація доступна лише для пошти @mil.gov.ua" }, { status: 400 });
    }

    const profile = await db.clientProfile.findUnique({
      where: { user_id: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Профіль не знайдено" }, { status: 404 });
    }

    const { randomInt } = await import("node:crypto");
    const code = randomInt(100000, 1000000).toString();

    await db.clientProfile.update({
      where: { user_id: session.userId },
      data: { militaryVerificationCode: code },
    });

    await sendMilitaryVerificationEmail(user.email, code);

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("[VERIFY_MILITARY_SEND]", error);
    return NextResponse.json({ error: "Внутрішня помилка серверу" }, { status: 500 });
  }
}
