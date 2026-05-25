import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { courseId } = await params;
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return new NextResponse("Not Found", { status: 404 });

  await db.course.delete({ where: { id: courseId } });
  return NextResponse.json({ success: true });
}
