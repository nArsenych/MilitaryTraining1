import CourseCard from "@/components/courses/CourseCard";
import ScrollToResults from "@/components/custom/ScrollToResults";
import { db } from "@/lib/db"
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

const SearchPage = async ({ searchParams }: { searchParams: Promise<{ query: string }>}) => {
  const { query } = await searchParams;
  const queryText = query || '';

  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: queryText } },
        { category: { name: { contains: queryText } } },
      ],
    },
    include: {
      category: true,
      level: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div id="results" className="min-h-screen bg-[#302E2B] px-6 py-10">
      <ScrollToResults />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[#FDAB04]/15">
            <Search size={18} className="text-[#FDAB04]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Результати пошуку</h1>
        </div>
        <p className="text-white/40 text-sm mb-8 ml-11">
          {courses.length > 0
            ? `Знайдено ${courses.length} курс(ів) за запитом «${queryText}»`
            : `Нічого не знайдено за запитом «${queryText}»`}
        </p>

        {courses.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search size={48} className="text-white/10 mb-4" />
            <p className="text-white/30 text-lg">Спробуйте інший запит</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
