import { db } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email та пароль обов'язкові" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Неправильний email або пароль" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Неправильний email або пароль" },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Підтвердіть вашу електронну пошту перед входом", requiresVerification: true, email: user.email },
        { status: 403 }
      );
    }

    // Auto-expire temporary blocks
    if (user.isBlocked && user.blockExpiry && new Date() > user.blockExpiry) {
      await db.user.update({ where: { id: user.id }, data: { isBlocked: false, blockExpiry: null } });
      user.isBlocked = false;
    }

    if (user.isBlocked) {
      const until = user.blockExpiry
        ? ` до ${user.blockExpiry.toLocaleDateString("uk-UA")}`
        : " назавжди";
      return NextResponse.json(
        { error: `Ваш акаунт заблоковано${until}` },
        { status: 403 }
      );
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("[LOGIN]", error);
    return NextResponse.json(
      { error: "Внутрішня помилка серверу" },
      { status: 500 }
    );
  }
}
