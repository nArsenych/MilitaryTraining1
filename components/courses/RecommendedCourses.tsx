import CourseCard from "./CourseCard";
import { Course } from "@prisma/client";
import { Sparkles, Star } from "lucide-react";

interface RecommendedCoursesProps {
  courses: (Course & Record<string, unknown>)[];
  type: "personalized" | "top-rated";
}

const RecommendedCourses = ({ courses, type }: RecommendedCoursesProps) => {
  if (courses.length === 0) return null;

  const Icon = type === "personalized" ? Sparkles : Star;

  return (
    <div className="mt-16">
      {/* section header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-[#FDAB04]/15">
          <Icon size={20} className="text-[#FDAB04]" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          {type === "personalized" ? "Рекомендовані для вас" : "Найкращі за оцінками"}
        </h2>
      </div>
      <p className="text-sm text-white/40 mb-8 ml-11">
        {type === "personalized"
          ? "На основі курсів, які ви обирали раніше"
          : "Курси з найвищими оцінками від учасників"}
      </p>

      <div className="flex flex-wrap gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
