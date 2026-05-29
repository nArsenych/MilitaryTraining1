"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, BookOpen, MessageSquare, Building2 } from "lucide-react";
import toast from "react-hot-toast";

type CourseComplaint = {
  type: "course";
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  course: { id: string; title: string };
  user: { id: string; email: string; name: string | null };
};

type CommentComplaint = {
  type: "comment";
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  review: { id: string; comment: string | null; rating: number };
  organization: { id: string; full_name: string | null; user: { email: string } } | null;
  user: { id: string; email: string; name: string | null } | null;
};

type OrganizationComplaint = {
  type: "organization";
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  organization: { id: string; full_name: string | null; user: { email: string } };
  user: { id: string; email: string; name: string | null };
};

type Complaint = CourseComplaint | CommentComplaint | OrganizationComplaint;

interface Props {
  complaints: Complaint[];
  status: string;
  type: string;
}

const STATUS_TABS = [
  { key: "PENDING", label: "Нові" },
  { key: "RESOLVED", label: "Вирішені" },
  { key: "DISMISSED", label: "Відхилені" },
];

const TYPE_TABS = [
  { key: "", label: "Всі" },
  { key: "course", label: "На курси" },
  { key: "comment", label: "На коментарі" },
  { key: "organization", label: "На організації" },
];

function getComplaintSender(c: Complaint): string {
  if (c.type === "comment") {
    return c.organization
      ? (c.organization.full_name || c.organization.user.email)
      : (c.user?.name || c.user?.email || "—");
  }
  return c.user.name || c.user.email;
}

function ComplaintTypeBadge({ type }: { readonly type: Complaint["type"] }) {
  if (type === "course") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
        <BookOpen size={10} />
        Скарга на курс
      </span>
    );
  }
  if (type === "comment") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
        <MessageSquare size={10} />
        Скарга на коментар
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
      <Building2 size={10} />
      Скарга на організацію
    </span>
  );
}

function ComplaintSubject({ c }: { readonly c: Complaint }) {
  if (c.type === "course") {
    return (
      <p className="text-white font-semibold text-sm mb-0.5 line-clamp-1">
        Курс: {c.course.title}
      </p>
    );
  }
  if (c.type === "comment") {
    return (
      <p className="text-white font-semibold text-sm mb-0.5 line-clamp-1">
        Коментар: «{c.review.comment || "без тексту"}» (⭐ {c.review.rating})
      </p>
    );
  }
  return (
    <p className="text-white font-semibold text-sm mb-0.5 line-clamp-1">
      Організація: {c.organization.full_name || c.organization.user.email}
    </p>
  );
}

const AdminComplaintsTable = ({ complaints, status, type }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams({ status, type, ...params });
    startTransition(() => router.push(`/admin/complaints?${sp}`));
  };

  const resolve = async (complaint: Complaint, newStatus: "RESOLVED" | "DISMISSED") => {
    setLoading(complaint.id);
    let path: string;
    if (complaint.type === "course") {
      path = `/api/admin/complaints/course/${complaint.id}`;
    } else if (complaint.type === "comment") {
      path = `/api/admin/complaints/comment/${complaint.id}`;
    } else {
      path = `/api/admin/complaints/organization/${complaint.id}`;
    }
    try {
      const res = await fetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update complaint status");
      toast.success(newStatus === "RESOLVED" ? "Вирішено" : "Відхилено");
      router.refresh();
    } catch {
      toast.error("Помилка");
    } finally {
      setLoading(null);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm("Видалити курс? Ця дія незворотна.")) return;
    setLoading(courseId);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      toast.success("Курс видалено");
      router.refresh();
    } catch {
      toast.error("Помилка");
    } finally {
      setLoading(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Видалити коментар? Ця дія незворотна.")) return;
    setLoading(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      toast.success("Коментар видалено");
      router.refresh();
    } catch {
      toast.error("Помилка");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate({ status: t.key, type })}
              disabled={isPending}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === t.key ? "bg-[#FDAB04] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {TYPE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate({ status, type: t.key })}
              disabled={isPending}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                type === t.key ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">Скарг немає</div>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map((c) => (
            <div key={c.id} className="rounded-2xl bg-[#3D3A36] border border-white/8 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-2">
                    <ComplaintTypeBadge type={c.type} />
                    <span className="text-white/30 text-[10px]">
                      {new Date(c.createdAt).toLocaleDateString("uk-UA")}
                    </span>
                  </div>

<ComplaintSubject c={c} />

                  {/* from */}
                  <p className="text-white/40 text-xs mb-3">
                    Від: {getComplaintSender(c)}
                  </p>

<div className="rounded-xl bg-[#302E2B] border border-white/8 px-4 py-3 text-sm text-white/70 leading-relaxed">
                    {c.reason}
                  </div>
                </div>

{status === "PENDING" && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {c.type === "course" && (
                      <button
                        onClick={() => deleteCourse(c.course.id)}
                        disabled={!!loading}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Видалити курс
                      </button>
                    )}
                    {c.type === "comment" && (
                      <button
                        onClick={() => deleteReview(c.review.id)}
                        disabled={!!loading}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Видалити коментар
                      </button>
                    )}
                    {c.type === "organization" && (
                      <span className="px-3 py-1.5 text-white/30 text-xs">
                        Профіль організації
                      </span>
                    )}
                    <button
                      onClick={() => resolve(c, "RESOLVED")}
                      disabled={!!loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} />
                      Вирішено
                    </button>
                    <button
                      onClick={() => resolve(c, "DISMISSED")}
                      disabled={!!loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-white/50 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Відхилити
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminComplaintsTable;
