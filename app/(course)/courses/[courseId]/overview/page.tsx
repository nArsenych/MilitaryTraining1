import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import ReadText from "@/components/custom/ReadTwxt";
import Link from "next/link";
import ReviewForm from "@/components/courses/ReviewForm";
import ReviewsList from "@/components/courses/ReviewsList";

export const dynamic = "force-dynamic";

const CourseOverview = async ({ params }: { params: Promise<{ courseId: string }> }) => {
  const { courseId } = await params;
  const session = await getSession();

  const course = await db.course.findUnique({
    where: { id: courseId, isPublished: true },
    include: {
      organization: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!course) return redirect("/");

  const userProfile = course.organization;

  let level;
  if (course.levelId) level = await db.level.findUnique({ where: { id: course.levelId } });
  let city;
  if (course.cityId) city = await db.city.findUnique({ where: { id: course.cityId } });

  // Відгуки
  const reviews = await db.review.findMany({
    where: { courseId },
    include: {
      profile: { select: { full_name: true, isOrganization: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Перевірка: чи може поточний користувач залишити відгук
  let canReview = false;

  if (session) {
    const currentProfile = await db.profile.findUnique({
      where: { user_id: session.userId },
    });

    if (currentProfile) {
      const confirmedPurchase = await db.purchase.findFirst({
        where: {
          customerId: currentProfile.id,
          courseId,
          confirmed: true,
        },
      });

      if (confirmedPurchase) {
        const alreadyReviewed = await db.review.findUnique({
          where: {
            profileId_courseId: {
              profileId: currentProfile.id,
              courseId,
            },
          },
        });

canReview = !alreadyReviewed;
      }
    }
  }

  const hasReviewed = session && !canReview && await (async () => {
    const profile = await db.profile.findUnique({ where: { user_id: session.userId } });
    if (!profile) return false;
    const review = await db.review.findUnique({
      where: { profileId_courseId: { profileId: profile.id, courseId } },
    });
    return !!review;
  })();

  return (
    <div className="px-6 py-4 flex flex-col gap-5 text-sm">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-[#ebac66]">{course.title}</h1>
      </div>

      <div className="flex gap-2 items-center">
        {userProfile && (
          <Link href={`/profile/${userProfile.id}/overview`} className="border rounded-lg cursor-pointer p-2">
            <p className="text-[#ebac66] font-bold">Організація:</p>
            <p>{userProfile.full_name || userProfile.user?.name || "Невідома організація"}</p>
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Ціна:</p>
        <p>{course.price} грн</p>
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Для кого розрахований курс:</p>
        <p>{level?.name}</p>
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Де буде проходити:</p>
        <p>{city?.name}</p>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Дата початку:</p>
          <p>{course.startDate?.toLocaleDateString("uk-UA")}</p>
        </div>
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Дата закінчення:</p>
          <p>{course.endDate?.toLocaleDateString("uk-UA")}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Від якого віку:</p>
          <p>{course.startAge}</p>
        </div>
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">До якого віку:</p>
          <p>{course.endAge}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[#ebac66] font-bold">Опис:</p>
        <ReadText value={course.description!} />
      </div>

      {/* Відгуки */}
      <div className="border-t pt-4 mt-2">
        <h2 className="text-xl font-bold text-[#ebac66] mb-4">Відгуки</h2>

{canReview && (
          <div className="mb-6">
            <ReviewForm courseId={courseId} />
          </div>
        )}

        {hasReviewed && (
          <p className="text-sm text-green-600 mb-4">✓ Ви вже оцінили цей курс</p>
        )}

        <ReviewsList
          reviews={reviews.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          avgRating={avgRating}
          count={reviews.length}
        />
      </div>
    </div>
  );
};

export default CourseOverview;