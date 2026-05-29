"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface AdminCourse {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
  organization: { full_name: string | null; user: { email: string } };
  _count: { complaints: number; reviews: number };
}

interface Props {
  courses: AdminCourse[];
  total: number;
  page: number;
  search: string;
}

const PAGES = (total: number) => Math.ceil(total / 20);

const AdminCoursesTable = ({ courses, total, page, search: initialSearch }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams({ search, page: String(page), ...params });
    startTransition(() => router.push(`/admin/courses?${sp}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search, page: "1" });
  };

  const deleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Видалити курс "${title}"? Ця дія незворотна.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      toast.success("Курс видалено");
      router.refresh();
    } catch {
      toast.error("Помилка при видаленні");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за назвою..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#3D3A36] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FDAB04]/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#FDAB04] text-black text-sm font-semibold"
        >
          Знайти
        </button>
      </form>

      <div className="rounded-2xl bg-[#3D3A36] border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Курс</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Організація</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Статус</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Скарги</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium line-clamp-1">{c.title}</p>
                    <p className="text-white/30 text-xs mt-0.5">{new Date(c.createdAt).toLocaleDateString("uk-UA")}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white/70 text-xs">{c.organization.full_name || c.organization.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.isPublished ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"
                      }`}
                    >
                      {c.isPublished ? "Опубліковано" : "Чернетка"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {c._count.complaints > 0 ? (
                      <span className="text-orange-400 font-semibold text-xs">{c._count.complaints}</span>
                    ) : (
                      <span className="text-white/30 text-xs">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => deleteCourse(c.id, c.title)}
                      disabled={loading}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                      title="Видалити курс"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {PAGES(total) > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-white/40 text-xs">Сторінка {page} з {PAGES(total)}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || isPending}
              onClick={() => navigate({ page: String(page - 1) })}
              className="p-1.5 rounded-lg bg-white/8 disabled:opacity-30 hover:bg-white/15 transition-colors"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              disabled={page >= PAGES(total) || isPending}
              onClick={() => navigate({ page: String(page + 1) })}
              className="p-1.5 rounded-lg bg-white/8 disabled:opacity-30 hover:bg-white/15 transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCoursesTable;
