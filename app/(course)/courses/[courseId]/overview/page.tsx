import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, isAdmin as checkIsAdmin } from "@/lib/auth";
import ReadText from "@/components/custom/ReadTwxt";
import Link from "next/link";
import Image from "next/image";
import CourseDetailTabs from "@/components/courses/CourseDetailTabs";
import CourseComplaintButton from "@/components/courses/CourseComplaintButton";
import { MapPin, Calendar, Users, Tag, Banknote, CheckCircle, Clock } from "lucide-react";

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
      runs: { orderBy: { startDate: "desc" } },
    },
  });

  if (!course) return redirect("/");

  const userProfile = course.organization;

  let level;
  if (course.levelId) level = await db.level.findUnique({ where: { id: course.levelId } });
  let city;
  if (course.cityId) city = await db.city.findUnique({ where: { id: course.cityId } });
  let category;
  if (course.categoryId) category = await db.category.findUnique({ where: { id: course.categoryId } });

  const reviews = await db.review.findMany({
    where: { courseId },
    include: {
      profile: { select: { full_name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Normalize reviews shape for frontend — reviews can only be from ClientProfile
  const normalizedReviews = reviews.map((r) => ({
    ...r,
    profile: { ...r.profile, isOrganization: false },
  }));

  let canComplain = false;
  let isOrganization = false;
  let isAdmin = false;
  let canReview = false;
  if (session) {
    const [currentProfile, orgProfile, admin] = await Promise.all([
      db.clientProfile.findUnique({ where: { user_id: session.userId } }),
      db.organizationProfile.findUnique({ where: { user_id: session.userId } }),
      checkIsAdmin(session.userId),
    ]);
    isOrganization = !!orgProfile;
    isAdmin = admin;
    if (currentProfile && !admin) {
      canComplain = true;
      const confirmedPurchase = await db.purchase.findFirst({
        where: { customerId: currentProfile.id, courseId, confirmed: true },
      });
      if (confirmedPurchase) {
        const alreadyReviewed = await db.review.findUnique({
          where: { profileId_courseId: { profileId: currentProfile.id, courseId } },
        });
        canReview = !alreadyReviewed;
      }
    }
  }

  const hasReviewed = session && !canReview && await (async () => {
    const profile = await db.clientProfile.findUnique({ where: { user_id: session.userId } });
    if (!profile) return false;
    const review = await db.review.findUnique({
      where: { profileId_courseId: { profileId: profile.id, courseId } },
    });
    return !!review;
  })();

  const fmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" }) : null;

  const durationDays =
    course.startDate && course.endDate
      ? Math.ceil((new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) / 86400000)
      : null;

  const meta = [
    { icon: Banknote, label: "Ціна",     value: course.price ? `${course.price} грн` : "Безкоштовно" },
    { icon: Tag,      label: "Рівень",   value: level?.name },
    { icon: MapPin,   label: "Місто",    value: city?.name },
    { icon: Users,    label: "Вік",      value: course.startAge ? `від ${course.startAge}${course.endAge ? ` до ${course.endAge}` : ""} р.` : undefined },
    { icon: Calendar, label: "Початок",  value: fmt(course.startDate) },
    { icon: Calendar, label: "Кінець",   value: fmt(course.endDate) },
    { icon: Clock,    label: "Тривалість", value: durationDays ? `${durationDays} дн.` : undefined },
  ].filter((m) => m.value);

  return (
    <div className="min-h-screen">
      {/* ── Hero banner ── */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={course.imageUrl || "/course_backround.png"}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#302E2B] via-[#302E2B]/55 to-transparent" />

        {/* category pill */}
        {category && (
          <span className="absolute top-4 left-6 bg-[#FDAB04] text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {category.name}
          </span>
        )}

        {/* title block */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg mb-2">
            {course.title}
          </h1>
          {userProfile && (
            <Link
              href={`/profile/${userProfile.id}/overview`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FDAB04] hover:text-[#ebac66] transition-colors"
            >
              <CheckCircle size={13} />
              {userProfile.full_name || userProfile.user?.name || "Невідома організація"}
            </Link>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-6 py-7 flex flex-col gap-7 max-w-3xl">

        {/* meta pills row */}
        <div className="flex flex-wrap gap-2">
          {meta.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-xs text-white/70"
            >
              <Icon size={12} className="text-[#FDAB04] shrink-0" />
              <span className="text-white/40">{label}:</span>
              <span className="font-medium text-white/85">{value}</span>
            </div>
          ))}
        </div>

        {/* description */}
        {course.description && (
          <div className="rounded-2xl bg-[#3D3A36] border border-white/8 px-5 py-5">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Опис курсу</p>
            <div className="text-white/75 leading-relaxed text-sm">
              <ReadText value={course.description} />
            </div>
          </div>
        )}

        {/* divider */}
        <div className="border-t border-white/8" />

        {/* complaint button for registered clients */}
        {canComplain && (
          <div className="flex justify-end">
            <CourseComplaintButton courseId={courseId} />
          </div>
        )}

        {/* tabs: відгуки / історія */}
        <CourseDetailTabs
          courseId={courseId}
          reviews={normalizedReviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          avgRating={avgRating}
          canReview={canReview}
          hasReviewed={!!hasReviewed}
          isOrganization={isOrganization}
          isAdmin={isAdmin}
          runs={course.runs.map((r) => ({
            id: r.id,
            startDate: r.startDate.toISOString(),
            endDate: r.endDate.toISOString(),
          }))}
        />
      </div>
    </div>
  );
};

export default CourseOverview;
