import { db } from "@/lib/db";
import { getSession, isUserBlocked } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Тільки зареєстровані користувачі можуть надсилати скарги" }, { status: 401 });
  }

  if (await isUserBlocked(session.userId)) {
    return NextResponse.json({ error: "Ваш акаунт заблоковано" }, { status: 403 });
  }

  const { organizationId } = await params;
  const { reason } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Причина скарги обов'язкова" }, { status: 400 });
  }

  const org = await db.organizationProfile.findUnique({ where: { id: organizationId } });
  if (!org) return new NextResponse("Not Found", { status: 404 });

  // Cannot complain about your own organization
  if (org.user_id === session.userId) {
    return NextResponse.json({ error: "Ви не можете скаржитися на власний профіль" }, { status: 400 });
  }

  const existing = await db.organizationComplaint.findFirst({
    where: { organizationId, userId: session.userId, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "Ви вже надіслали скаргу на цю організацію" }, { status: 400 });
  }

  const complaint = await db.organizationComplaint.create({
    data: { organizationId, userId: session.userId, reason },
  });

  return NextResponse.json(complaint, { status: 201 });
}
