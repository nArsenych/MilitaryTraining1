import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { sendBlockEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

// POST — block user; DELETE — unblock
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { userId } = await params;
  const { reason, days } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Причина обов'язкова" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
  if (!user) return new NextResponse("Not Found", { status: 404 });
  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Не можна заблокувати адміністратора" }, { status: 400 });
  }

  const blockExpiry = days ? new Date(Date.now() + days * 86_400_000) : null;

  await db.user.update({
    where: { id: userId },
    data: { isBlocked: true, blockExpiry },
  });

  await sendBlockEmail(user.email, reason, blockExpiry);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { userId } = await params;
  await db.user.update({
    where: { id: userId },
    data: { isBlocked: false, blockExpiry: null },
  });

  return NextResponse.json({ success: true });
}
