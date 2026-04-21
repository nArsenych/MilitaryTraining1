import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    // organizationId is now Profile.id
    const profile = await db.profile.findUnique({
      where: {
        id: params.organizationId,
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
