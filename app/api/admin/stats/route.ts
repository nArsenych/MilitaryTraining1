import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [totalUsers, blockedUsers, pendingCourseComplaints, pendingCommentComplaints, totalCourses, totalWarnings] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { isBlocked: true } }),
      db.courseComplaint.count({ where: { status: "PENDING" } }),
      db.commentComplaint.count({ where: { status: "PENDING" } }),
      db.course.count(),
      db.userWarning.count(),
    ]);

  return NextResponse.json({
    totalUsers,
    blockedUsers,
    pendingComplaints: pendingCourseComplaints + pendingCommentComplaints,
    totalCourses,
    totalWarnings,
  });
}
