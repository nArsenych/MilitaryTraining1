import { db } from "@/lib/db";
import { getSession, signToken, setAuthCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, currentPassword, newEmail, newPassword } = await req.json();

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Невірний поточний пароль" }, { status: 400 });
    }

    if (type === "email") {
      if (!newEmail) {
        return NextResponse.json({ error: "Email обов'язковий" }, { status: 400 });
      }
      const existing = await db.user.findUnique({ where: { email: newEmail } });
      if (existing) {
        return NextResponse.json({ error: "Цей email вже використовується" }, { status: 409 });
      }
      await db.user.update({ where: { id: user.id }, data: { email: newEmail } });
      const token = await signToken({ userId: user.id, email: newEmail });
      await setAuthCookie(token);
    } else if (type === "password") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "Пароль має містити мінімум 6 символів" }, { status: 400 });
      }
      const newHash = await bcrypt.hash(newPassword, 12);
      await db.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    } else {
      return NextResponse.json({ error: "Невірний тип запиту" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CREDENTIALS_PATCH]", error);
    return NextResponse.json({ error: "Внутрішня помилка" }, { status: 500 });
  }
}
