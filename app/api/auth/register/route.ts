import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import { randomInt } from "node:crypto";

function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email та пароль обов'язкові" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль має містити щонайменше 6 символів" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const code = generateCode();
        await db.user.update({ where: { email }, data: { verificationToken: code } });
        await sendVerificationEmail(email, code);
        return NextResponse.json(
          { requiresVerification: true, message: "Новий код надіслано" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Користувач з таким email вже існує" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateCode();

    await db.user.create({
      data: { email, passwordHash, name: name || null, emailVerified: false, verificationToken: code },
    });

    await sendVerificationEmail(email, code);

    return NextResponse.json({ requiresVerification: true }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Внутрішня помилка серверу" }, { status: 500 });
  }
}
