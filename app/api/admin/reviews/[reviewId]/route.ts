import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { reviewId } = await params;
  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return new NextResponse("Not Found", { status: 404 });

  await db.review.delete({ where: { id: reviewId } });
  return NextResponse.json({ success: true });
}
