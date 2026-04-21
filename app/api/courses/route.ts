import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
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

    const { title, categoryId } = await req.json();

    const newCourse = await db.course.create({
      data: {
        title,
        categoryId,
        organizationId: profile.id
      }
    });

    return NextResponse.json(newCourse, { status: 200 });
  } catch (err) {
    console.log("[courses_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
