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

    const clientProfile = await db.clientProfile.findUnique({ where: { user_id: session.userId } });
    if (!clientProfile) return new NextResponse("Profile not found", { status: 404 });

    const { courseId } = await params;

    const purchase = await db.purchase.findUnique({
      where: { customerId_courseId: { customerId: clientProfile.id, courseId } },
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
        customerId_courseId: { customerId: clientProfile.id, courseId },
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

    // Only client profiles can enroll — organizations cannot
    const clientProfile = await db.clientProfile.findUnique({
      where: { user_id: session.userId },
    });

    if (!clientProfile) {
      // Check if they are an organization (to give a more informative error)
      const orgProfile = await db.organizationProfile.findUnique({
        where: { user_id: session.userId },
      });
      if (orgProfile) {
        return new NextResponse("Organizations cannot enroll in courses", { status: 403 });
      }
      return new NextResponse("Profile not found", { status: 404 });
    }

    const { courseId } = await params;

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        organizationId: true,
        startDate: true,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    if (course.startDate && new Date(course.startDate) < new Date()) {
      return NextResponse.json(
        { error: "Запис на курс закрито — дата початку вже минула" },
        { status: 400 }
      );
    }

    const existingPurchase = await db.purchase.findUnique({
      where: {
        customerId_courseId: {
          customerId: clientProfile.id,
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
        customerId: clientProfile.id,
        organizationId: course.organizationId,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.log("[COURSE_ENROLL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
