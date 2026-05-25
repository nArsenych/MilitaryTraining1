import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Код обов'язковий" }, { status: 400 });
    }

    const profile = await db.clientProfile.findUnique({
      where: { user_id: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Профіль не знайдено" }, { status: 404 });
    }

    if (!profile.militaryVerificationCode) {
      return NextResponse.json({ error: "Спочатку запросіть код верифікації" }, { status: 400 });
    }

    if (profile.militaryVerificationCode !== code.trim()) {
      return NextResponse.json({ error: "Неправильний код. Спробуйте ще раз." }, { status: 400 });
    }

    await db.clientProfile.update({
      where: { user_id: session.userId },
      data: {
        isMilitary: true,
        isMilitaryVerified: true,
        militaryVerificationCode: null,
      },
    });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("[VERIFY_MILITARY_CONFIRM]", error);
    return NextResponse.json({ error: "Внутрішня помилка серверу" }, { status: 500 });
  }
}
