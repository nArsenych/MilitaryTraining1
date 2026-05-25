import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { sendWarningEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { userId } = await params;
  const { reason } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Причина обов'язкова" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) return new NextResponse("Not Found", { status: 404 });

  await db.userWarning.create({ data: { userId, reason } });
  await sendWarningEmail(user.email, reason);

  return NextResponse.json({ success: true });
}
