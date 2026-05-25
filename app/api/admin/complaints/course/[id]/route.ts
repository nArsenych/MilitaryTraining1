import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.userId))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["RESOLVED", "DISMISSED"].includes(status)) {
    return NextResponse.json({ error: "Неправильний статус" }, { status: 400 });
  }

  const complaint = await db.courseComplaint.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(complaint);
}
