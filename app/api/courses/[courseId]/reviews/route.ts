import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const reviews = await db.review.findMany({
      where: { courseId },
      include: {
        profile: {
          select: { full_name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Normalize shape for frontend compatibility: add isOrganization: false
    // since only ClientProfiles can write reviews
    const normalizedReviews = reviews.map((r) => ({
      ...r,
      profile: { ...r.profile, isOrganization: false },
    }));

    return NextResponse.json({ reviews: normalizedReviews, avgRating, count: reviews.length });
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only client profiles can leave reviews
    const clientProfile = await db.clientProfile.findUnique({
      where: { user_id: session.userId },
    });

    if (!clientProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Перевірка: чи є підтверджений запис
    const confirmedPurchase = await db.purchase.findFirst({
      where: {
        customerId: clientProfile.id,
        courseId,
        confirmed: true,
      },
    });

    if (!confirmedPurchase) {
      return NextResponse.json(
        { error: "Залишити відгук можуть лише користувачі з підтвердженим записом" },
        { status: 403 }
      );
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Оцінка має бути від 1 до 5" },
        { status: 400 }
      );
    }

    // Перевірка: чи вже є відгук
    const existingReview = await db.review.findUnique({
      where: {
        profileId_courseId: {
          profileId: clientProfile.id,
          courseId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Ви вже залишили відгук на цей курс" },
        { status: 400 }
      );
    }

    // Створити новий
    const review = await db.review.create({
      data: {
        rating,
        comment: comment || null,
        courseId,
        profileId: clientProfile.id,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("[REVIEWS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
