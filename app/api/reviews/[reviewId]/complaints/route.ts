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

  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { profile: { select: { user_id: true } } },
  });
  if (!review) return new NextResponse("Not Found", { status: 404 });

  if (review.profile.user_id === session.userId) {
    return NextResponse.json({ error: "Ви не можете скаржитися на власний відгук" }, { status: 400 });
  }

  const [orgProfile, clientProfile] = await Promise.all([
    db.organizationProfile.findUnique({ where: { user_id: session.userId } }),
    db.clientProfile.findUnique({ where: { user_id: session.userId } }),
  ]);

  if (!orgProfile && !clientProfile) {
    return NextResponse.json({ error: "Профіль не знайдено" }, { status: 403 });
  }

  const existingWhere = orgProfile
    ? { reviewId, organizationId: orgProfile.id, status: "PENDING" as const }
    : { reviewId, userId: session.userId, status: "PENDING" as const };

  const existing = await db.commentComplaint.findFirst({ where: existingWhere });
  if (existing) {
    return NextResponse.json({ error: "Ви вже надіслали скаргу на цей коментар" }, { status: 400 });
  }

  const complaint = await db.commentComplaint.create({
    data: orgProfile
      ? { reviewId, organizationId: orgProfile.id, reason }
      : { reviewId, userId: session.userId, reason },
  });

  return NextResponse.json(complaint, { status: 201 });
}
