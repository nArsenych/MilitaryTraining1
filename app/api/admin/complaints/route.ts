import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type"); // "course" | "comment" | "organization" | null (all)
  const status = (searchParams.get("status") || "PENDING") as "PENDING" | "RESOLVED" | "DISMISSED";

  const [courseComplaints, commentComplaints, orgComplaints] = await Promise.all([
    type && type !== "course"
      ? []
      : db.courseComplaint.findMany({
          where: { status },
          include: {
            course: { select: { id: true, title: true } },
            user: { select: { id: true, email: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
    type && type !== "comment"
      ? []
      : db.commentComplaint.findMany({
          where: { status },
          include: {
            review: { select: { id: true, comment: true, rating: true } },
            organization: { select: { id: true, full_name: true, user: { select: { email: true } } } },
          },
          orderBy: { createdAt: "desc" },
        }),
    type && type !== "organization"
      ? []
      : db.organizationComplaint.findMany({
          where: { status },
          include: {
            organization: { select: { id: true, full_name: true, user: { select: { email: true } } } },
            user: { select: { id: true, email: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
  ]);

  const normalized = [
    ...courseComplaints.map((c) => ({ ...c, type: "course" as const })),
    ...commentComplaints.map((c) => ({ ...c, type: "comment" as const })),
    ...orgComplaints.map((c) => ({ ...c, type: "organization" as const })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json(normalized);
}
