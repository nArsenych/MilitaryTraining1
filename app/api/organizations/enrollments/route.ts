import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationProfile = await db.profile.findUnique({
      where: {
        user_id: session.userId,
      },
    });

    if (!organizationProfile || !organizationProfile.isOrganization) {
      return new NextResponse("Not authorized as organization", { status: 403 });
    }

    const coursesWithEnrollments = await db.course.findMany({
      where: {
        organizationId: organizationProfile.id,
      },
      include: {
        purchases: {
          include: {
            student: {
              select: {
                id: true,
                full_name: true,
                age: true,
                phone_number: true,
                instagram: true,
                telegram: true,
                facebook: true,
                isMilitary: true,
              },
            },
          },
        },
        category: true,
        city: true,
        level: true,
      },
    });

    return NextResponse.json(coursesWithEnrollments);
  } catch (error) {
    console.log("[ORGANIZATION_ENROLLMENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
