import { db } from "@/lib/db";
import { getSession, isUserBlocked } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  if (await isUserBlocked(session.userId)) {
    return NextResponse.json({ error: "Ваш акаунт заблоковано" }, { status: 403 });
  }

  const { reviewId } = await params;
  const { reason } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Причина скарги обов'язкова" }, { status: 400 });
  }

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return new NextResponse("Not Found", { status: 404 });

  // Only organizations can complain about comments
  const orgProfile = await db.organizationProfile.findUnique({ where: { user_id: session.userId } });
  if (!orgProfile) {
    return NextResponse.json({ error: "Тільки організації можуть надсилати скарги на коментарі" }, { status: 403 });
  }

  const existing = await db.commentComplaint.findFirst({
    where: { reviewId, organizationId: orgProfile.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "Ви вже надіслали скаргу на цей коментар" }, { status: 400 });
  }

  const complaint = await db.commentComplaint.create({
    data: { reviewId, organizationId: orgProfile.id, reason },
  });

  return NextResponse.json(complaint, { status: 201 });
}
