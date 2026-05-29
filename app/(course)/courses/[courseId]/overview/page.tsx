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

type UserContext = {
  isOrganization: boolean;
  isAdmin: boolean;
  canComplain: boolean;
  canReview: boolean;
  hasReviewed: boolean;
  canComplainAboutReview: boolean;
};

async function resolveUserContext(userId: string, courseId: string, courseOrganizationId: string): Promise<UserContext> {
  const [clientProfile, orgProfile, admin] = await Promise.all([
    db.clientProfile.findUnique({ where: { user_id: userId } }),
    db.organizationProfile.findUnique({ where: { user_id: userId } }),
    checkIsAdmin(userId),
  ]);

  if (admin) {
    return { isOrganization: !!orgProfile, isAdmin: true, canComplain: false, canReview: false, hasReviewed: false, canComplainAboutReview: false };
  }

  if (orgProfile) {
    const isOwnCourse = courseOrganizationId === orgProfile.id;
    return { isOrganization: true, isAdmin: false, canComplain: !isOwnCourse, canReview: false, hasReviewed: false, canComplainAboutReview: true };
  }

  if (!clientProfile) {
    return { isOrganization: false, isAdmin: false, canComplain: false, canReview: false, hasReviewed: false, canComplainAboutReview: false };
  }

  const [confirmedPurchase, existingReview] = await Promise.all([
    db.purchase.findFirst({ where: { customerId: clientProfile.id, courseId, confirmed: true } }),
    db.review.findUnique({ where: { profileId_courseId: { profileId: clientProfile.id, courseId } } }),
  ]);

  const hasReviewed = !!existingReview;
  const canReview = !!confirmedPurchase && !hasReviewed;

  return { isOrganization: false, isAdmin: false, canComplain: true, canReview, hasReviewed, canComplainAboutReview: true };
}

const noSession: UserContext = {
  isOrganization: false, isAdmin: false, canComplain: false,
  canReview: false, hasReviewed: false, canComplainAboutReview: false,
};

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

  const [level, city, category, reviews] = await Promise.all([
    course.levelId    ? db.level.findUnique({ where: { id: course.levelId } })       : null,
    course.cityId     ? db.city.findUnique({ where: { id: course.cityId } })         : null,
    course.categoryId ? db.category.findUnique({ where: { id: course.categoryId } }) : null,
    db.review.findMany({
      where: { courseId },
      include: { profile: { select: { full_name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const normalizedReviews = reviews.map((r) => ({
    ...r,
    profile: { ...r.profile, isOrganization: false },
  }));

  const { isOrganization, isAdmin, canComplain, canReview, hasReviewed, canComplainAboutReview } = session
    ? await resolveUserContext(session.userId, courseId, course.organizationId)
    : noSession;

  const fmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" }) : null;

  const durationDays = course.startDate && course.endDate
    ? Math.ceil((new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) / 86400000)
    : null;

  const endAgePart = course.endAge ? ` до ${course.endAge}` : "";
  const ageValue = course.startAge ? `від ${course.startAge}${endAgePart} р.` : undefined;

  const meta = [
    { icon: Banknote, label: "Ціна",       value: course.price ? `${course.price} грн` : "Безкоштовно" },
    { icon: Tag,      label: "Рівень",     value: level?.name },
    { icon: MapPin,   label: "Місто",      value: city?.name },
    { icon: Users,    label: "Вік",        value: ageValue },
    { icon: Calendar, label: "Початок",    value: fmt(course.startDate) },
    { icon: Calendar, label: "Кінець",     value: fmt(course.endDate) },
    { icon: Clock,    label: "Тривалість", value: durationDays ? `${durationDays} дн.` : undefined },
  ].filter((m) => m.value);

  return (
    <div className="min-h-screen">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={course.imageUrl || "/course_backround.png"}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#302E2B] via-[#302E2B]/55 to-transparent" />

        {category && (
          <span className="absolute top-4 left-6 bg-[#FDAB04] text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {category.name}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg mb-2">
            {course.title}
          </h1>
          {course.organization && (
            <Link
              href={`/profile/${course.organization.id}/overview`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FDAB04] hover:text-[#ebac66] transition-colors"
            >
              <CheckCircle size={13} />
              {course.organization.full_name || course.organization.user?.name || "Невідома організація"}
            </Link>
          )}
        </div>
      </div>

      <div className="px-6 py-7 flex flex-col gap-7 max-w-3xl">

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

        {course.description && (
          <div className="rounded-2xl bg-[#3D3A36] border border-white/8 px-5 py-5">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Опис курсу</p>
            <div className="text-white/75 leading-relaxed text-sm">
              <ReadText value={course.description} />
            </div>
          </div>
        )}

        <div className="border-t border-white/8" />

        {canComplain && (
          <div className="flex justify-end">
            <CourseComplaintButton courseId={courseId} />
          </div>
        )}

        <CourseDetailTabs
          courseId={courseId}
          reviews={normalizedReviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          avgRating={avgRating}
          canReview={canReview}
          hasReviewed={!!hasReviewed}
          isOrganization={isOrganization}
          isAdmin={isAdmin}
          canComplainAboutReview={canComplainAboutReview}
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
