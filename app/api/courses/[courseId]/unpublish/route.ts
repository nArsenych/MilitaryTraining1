import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  try {
    const session = await getSession();
    const { courseId } = await params;

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const orgProfile = await db.organizationProfile.findUnique({
      where: { user_id: session.userId },
    });

    if (!orgProfile) {
      return new Response("Organization profile not found", { status: 404 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, organizationId: orgProfile.id },
    });

    if (!course) {
      return new Response("Course not found", { status: 404 });
    }

    const unpublishedCourse = await db.course.update({
      where: { id: courseId, organizationId: orgProfile.id },
      data: { isPublished: false },
    });

    return NextResponse.json(unpublishedCourse, { status: 200 });
  } catch (err) {
    console.log("[courseId_unpublish_POST]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
