import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    
    const { organizationId } = await params;

    const profile = await db.profile.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!profile) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    return NextResponse.json({
      firstName: profile.full_name || profile.user?.name || "",
      lastName: ""
    });
  } catch (error) {
    console.log("[ORGANIZATION_GET] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
