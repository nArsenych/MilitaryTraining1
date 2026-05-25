import { db } from "@/lib/db";
import { Course } from "@prisma/client"
import { Feather, MapPin, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CourseCard = async ({ course }: { course: Course }) => {
  let level;
  if (course.levelId) {
    level = await db.level.findUnique({ where: { id: course.levelId } });
  }

  let city;
  if (course.cityId) {
    city = await db.city.findUnique({ where: { id: course.cityId } });
  }

  const profile = await db.organizationProfile.findUnique({
    where: { id: course.organizationId },
  });

  let category;
  if (course.categoryId) {
    category = await db.category.findUnique({ where: { id: course.categoryId } });
  }

  return (
    <Link
      href={`/courses/${course.id}/overview`}
      className="group flex flex-col w-full sm:w-[320px] rounded-2xl overflow-hidden bg-[#3D3A36] border border-white/10 hover:border-[#FDAB04]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
    >
      {/* image */}
      <div className="relative overflow-hidden">
        <Image
          src={course.imageUrl || "/course_backround.png"}
          alt={course.title}
          width={320}
          height={180}
          className="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* category badge */}
        {category && (
          <span className="absolute top-3 left-3 bg-[#FDAB04] text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {category.name}
          </span>
        )}
        {/* price badge */}
        <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
          {course.price ? `${course.price} грн` : "Безкоштовно"}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#FDAB04] transition-colors">
          {course.title}
        </h2>

        {/* org */}
        {profile && (
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <BadgeCheck size={13} className="text-[#FDAB04] shrink-0" />
            <span className="truncate">{profile.full_name || "Організація"}</span>
          </div>
        )}

        {/* meta row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
          {level && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Feather size={12} className="shrink-0" />
              <span>{level.name}</span>
            </div>
          )}
          {city && (
            <div className="flex items-center gap-1 text-white/50 text-xs ml-auto">
              <MapPin size={12} className="shrink-0" />
              <span>{city.name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CourseCard
