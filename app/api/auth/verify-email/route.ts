import { db } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email та код обов'язкові" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Неправильний код" }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email вже підтверджено" }, { status: 400 });
    }

    if (user.verificationToken !== code.trim()) {
      return NextResponse.json({ error: "Неправильний код. Спробуйте ще раз." }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    const jwt = await signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(jwt);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return NextResponse.json({ error: "Внутрішня помилка серверу" }, { status: 500 });
  }
}
