import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

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

    const orgProfile = await db.organizationProfile.findUnique({
      where: { user_id: session.userId },
    });

    if (!orgProfile) {
      return new NextResponse("Organization profile not found", { status: 404 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, organizationId: orgProfile.id },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const { startDate, endDate } = await req.json();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start < now) {
      return NextResponse.json(
        { error: "Дата початку не може бути в минулому" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "Дата початку має бути раніше дати закінчення" },
        { status: 400 }
      );
    }

    // Save current dates as historical run (only if course already has dates)
    if (course.startDate && course.endDate) {
      await db.courseRun.create({
        data: {
          courseId: course.id,
          startDate: course.startDate,
          endDate: course.endDate,
        },
      });
    }

    // Delete all purchases so previous participants can re-enroll
    await db.purchase.deleteMany({ where: { courseId: course.id } });

    // Update course with new dates, reset to draft
    const updated = await db.course.update({
      where: { id: courseId },
      data: {
        startDate: start,
        endDate: end,
        isPublished: false,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[COURSE_REPEAT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
