import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const userProfile = await db.profile.findUnique({ where: { user_id: session.userId } });
    if (!userProfile) return new NextResponse("Profile not found", { status: 404 });

    const { courseId } = await params;

    const purchase = await db.purchase.findUnique({
      where: { customerId_courseId: { customerId: userProfile.id, courseId } },
      select: { confirmed: true },
    });

    if (!purchase) return new NextResponse("Enrollment not found", { status: 404 });

    if (purchase.confirmed) {
      return NextResponse.json(
        { error: "Скасувати запис можна лише до підтвердження організацією" },
        { status: 403 }
      );
    }

    await db.purchase.delete({
      where: {
        customerId_courseId: { customerId: userProfile.id, courseId },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[COURSE_UNENROLL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userProfile = await db.profile.findUnique({
      where: {
        user_id: session.userId,
      },
    });

    if (!userProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    if (userProfile.isOrganization) {
      return new NextResponse("Organizations cannot enroll in courses", { status: 403 });
    }

    const { courseId } = await params;

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const existingPurchase = await db.purchase.findUnique({
      where: {
        customerId_courseId: {
          customerId: userProfile.id,
          courseId: courseId,
        },
      },
    });

    if (existingPurchase) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    const purchase = await db.purchase.create({
      data: {
        courseId: course.id,
        customerId: userProfile.id,
        organizationId: course.organizationId,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.log("[COURSE_ENROLL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
