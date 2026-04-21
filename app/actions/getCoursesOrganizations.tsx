import { db } from "@/lib/db"
import { Course, Prisma } from "@prisma/client"

const getCoursesByOrganization = async (organizationId: string | null): Promise<Course[]> => {
  const whereClause: Prisma.CourseWhereInput = {
    isPublished: true,
    ...(organizationId ? { organizationId } : {}),
  }

  const courses = await db.course.findMany({
    where: whereClause,
    include: {
      category: true,
      level: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return courses
}

export default getCoursesByOrganization