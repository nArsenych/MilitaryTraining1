import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";

function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email обов'язковий" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const code = generateCode();
    await db.user.update({ where: { id: user.id }, data: { verificationToken: code } });
    await sendVerificationEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESEND_VERIFICATION]", error);
    return NextResponse.json({ error: "Внутрішня помилка серверу" }, { status: 500 });
  }
}
