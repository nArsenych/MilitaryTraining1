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

    const profile = await db.profile.findUnique({
      where: { user_id: session.userId },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const originalCourse = await db.course.findUnique({
      where: { id: courseId, organizationId: profile.id },
    });

    if (!originalCourse) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Знаходимо кореневий курс (якщо це вже повтор — беремо його parentCourseId)
    const rootCourseId = originalCourse.parentCourseId || originalCourse.id;

    const { startDate, endDate } = await req.json();

    const newCourse = await db.course.create({
      data: {
        title: originalCourse.title,
        description: originalCourse.description,
        imageUrl: originalCourse.imageUrl,
        categoryId: originalCourse.categoryId,
        cityId: originalCourse.cityId,
        levelId: originalCourse.levelId,
        startAge: originalCourse.startAge,
        endAge: originalCourse.endAge,
        price: originalCourse.price,
        organizationId: profile.id,
        parentCourseId: rootCourseId,
        isPublished: false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("[COURSE_REPEAT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}