import { db } from "@/lib/db";
import { getSession, isUserBlocked } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  if (await isUserBlocked(session.userId)) {
    return NextResponse.json({ error: "Ваш акаунт заблоковано" }, { status: 403 });
  }

  const { courseId } = await params;
  const { reason } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Причина скарги обов'язкова" }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return new NextResponse("Not Found", { status: 404 });

  // Only clients (not organizations) can complain about courses
  const clientProfile = await db.clientProfile.findUnique({ where: { user_id: session.userId } });
  if (!clientProfile) {
    return NextResponse.json({ error: "Тільки зареєстровані користувачі можуть надсилати скарги на курси" }, { status: 403 });
  }

  const existing = await db.courseComplaint.findFirst({
    where: { courseId, userId: session.userId, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "Ви вже надіслали скаргу на цей курс" }, { status: 400 });
  }

  const complaint = await db.courseComplaint.create({
    data: { courseId, userId: session.userId, reason },
  });

  return NextResponse.json(complaint, { status: 201 });
}
