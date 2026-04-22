import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  try {
    const session = await getSession();
    const { courseId } = await params;
    const values = await req.json();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { user_id: session.userId },
    });

    if (!profile) {
      return new Response("Profile not found", { status: 404 });
    }

    const course = await db.course.update({
      where: { id: courseId, organizationId: profile.id },
      data: { ...values },
    });

    return NextResponse.json(course, { status: 200 });
  } catch (err) {
    console.error(["courseId_PATCH", err]);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  try {
    const session = await getSession();
    const { courseId } = await params;

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { user_id: session.userId },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, organizationId: profile.id }
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    await db.course.delete({
      where: { id: courseId, organizationId: profile.id },
    });

    return new NextResponse("Course Deleted", { status: 200 });
  } catch (err) {
    console.error(["courseId_DELETE", err]);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
