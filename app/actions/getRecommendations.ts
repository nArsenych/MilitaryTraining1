import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getRecommendedCourses() {
  const now = new Date();
  const session = await getSession();

  const baseWhere = {
    isPublished: true,
    OR: [{ endDate: { gt: now } }, { endDate: null }],
  };

  if (session) {
    const profile = await db.profile.findUnique({
      where: { user_id: session.userId },
    });

    if (profile) {
      // Знаходимо курси, на які записувався користувач
      const userPurchases = await db.purchase.findMany({
        where: { customerId: profile.id },
        include: {
          course: {
            select: {
              categoryId: true,
              cityId: true,
              organizationId: true,
            },
          },
        },
      });

      if (userPurchases.length > 0) {
        // Збираємо категорії, міста та організації з минулих записів
        const categoryIds = [...new Set(userPurchases.map((p) => p.course.categoryId))];
        const cityIds = [...new Set(userPurchases.map((p) => p.course.cityId).filter(Boolean))] as string[];
        const orgIds = [...new Set(userPurchases.map((p) => p.course.organizationId))];

        // Курси, на які вже записаний — виключаємо
        const enrolledCourseIds = userPurchases.map((p) => p.courseId);

        // Шукаємо курси зі схожими параметрами
        const recommended = await db.course.findMany({
          where: {
            AND: [
              { isPublished: true },
              { OR: [{ endDate: { gt: now } }, { endDate: null }] },
              { id: { notIn: enrolledCourseIds } },
              {
                OR: [
                  { categoryId: { in: categoryIds } },
                  ...(cityIds.length > 0 ? [{ cityId: { in: cityIds } }] : []),
                  { organizationId: { in: orgIds } },
                ],
              },
            ],
          },
          include: {
            category: true,
            level: true,
            reviews: { select: { rating: true } },
          },
          take: 8,
        });

        // Сортуємо за релевантністю: більше збігів = вище
        const scored = recommended.map((course) => {
          let score = 0;
          if (categoryIds.includes(course.categoryId)) score += 3;
          if (course.cityId && cityIds.includes(course.cityId)) score += 2;
          if (orgIds.includes(course.organizationId)) score += 1;

          const avgRating =
            course.reviews.length > 0
              ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
              : 0;
          score += avgRating * 0.5;

          return { ...course, score };
        });

        scored.sort((a, b) => b.score - a.score);

        return {
          courses: scored,
          type: "personalized" as const,
        };
      }
    }
  }

  // Для незареєстрованих або без записів — курси з найвищою оцінкою
  const topRated = await db.course.findMany({
    where: baseWhere,
    include: {
      category: true,
      level: true,
      reviews: { select: { rating: true } },
    },
  });

  const withRating = topRated
    .map((course) => ({
      ...course,
      avgRating:
        course.reviews.length > 0
          ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
          : 0,
      reviewCount: course.reviews.length,
    }))
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

  return {
    courses: withRating,
    type: "top-rated" as const,
  };
}