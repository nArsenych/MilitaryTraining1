import { db } from "@/lib/db";
import { getSession, signToken, setAuthCookie } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

type UserRow = Awaited<ReturnType<typeof db.user.findUnique>> & {
  pendingEmail?: string | null;
};

async function handleConfirmEmail(user: NonNullable<UserRow>, code: string) {
  if (!code || !user.pendingEmail || !user.verificationToken) {
    return NextResponse.json({ error: "Спочатку запросіть зміну email" }, { status: 400 });
  }
  if (user.verificationToken !== code.trim()) {
    return NextResponse.json({ error: "Неправильний код. Спробуйте ще раз." }, { status: 400 });
  }
  const confirmedEmail = user.pendingEmail;
  await db.user.update({
    where: { id: user.id },
    data: { email: confirmedEmail, pendingEmail: null, verificationToken: null },
  });
  const token = await signToken({ userId: user.id, email: confirmedEmail, role: user.role });
  await setAuthCookie(token);
  return NextResponse.json({ success: true });
}

async function handleEmailChange(user: NonNullable<UserRow>, newEmail: string | undefined) {
  if (!newEmail) {
    return NextResponse.json({ error: "Email обов'язковий" }, { status: 400 });
  }
  const existing = await db.user.findUnique({ where: { email: newEmail } });
  if (existing) {
    return NextResponse.json({ error: "Цей email вже використовується" }, { status: 409 });
  }
  const { randomInt } = await import("crypto");
  const verificationCode = randomInt(100000, 1000000).toString();
  await db.user.update({
    where: { id: user.id },
    data: { pendingEmail: newEmail, verificationToken: verificationCode },
  });
  await sendVerificationEmail(newEmail, verificationCode);
  return NextResponse.json({ requiresVerification: true, pendingEmail: newEmail });
}

async function handlePasswordChange(user: NonNullable<UserRow>, newPassword: string | undefined) {
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Пароль має містити мінімум 6 символів" }, { status: 400 });
  }
  const newHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, currentPassword, newEmail, newPassword, code } = await req.json();

    const user = await db.user.findUnique({ where: { id: session.userId } }) as UserRow;
    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    if (type === "confirm-email") return handleConfirmEmail(user, code);

    const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Неправильний поточний пароль" }, { status: 400 });
    }

    if (type === "email")    return handleEmailChange(user, newEmail);
    if (type === "password") return handlePasswordChange(user, newPassword);

    return NextResponse.json({ error: "Неправильний тип запиту" }, { status: 400 });
  } catch (error) {
    console.error("[CREDENTIALS_PATCH]", error);
    return NextResponse.json({ error: "Внутрішня помилка" }, { status: 500 });
  }
}
