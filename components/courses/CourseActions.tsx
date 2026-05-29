"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface CourseActionsProps {
  courseId: string;
  courseTitle: string;
  courseEndDate: Date | string | null;
}

const todayStr = () => new Date().toISOString().split("T")[0];

const CourseActions = ({ courseId, courseTitle, courseEndDate }: CourseActionsProps) => {
  const isCourseEnded = courseEndDate ? new Date() > new Date(courseEndDate) : false;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [showRepeatForm, setShowRepeatForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/courses/${courseId}`);
      toast.success("Курс видалено");
      router.refresh();
    } catch {
      toast.error("Помилка видалення курсу");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRepeat = async () => {
    if (!startDate || !endDate) {
      toast.error("Вкажіть дати початку та закінчення");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      toast.error("Дата початку не може бути в минулому");
      return;
    }

    if (start > end) {
      toast.error("Дата закінчення не може бути меншою за дату початку");
      return;
    }

    setIsRepeating(true);
    try {
      await axios.post(`/api/courses/${courseId}/repeat`, { startDate, endDate });
      toast.success("Дати оновлено! Курс переведено в чернетку.");
      router.push(`/instructor/courses/${courseId}/basic`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Помилка оновлення курсу");
    } finally {
      setIsRepeating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showRepeatForm ? (
        <div className="flex items-center gap-2 bg-white/8 border border-white/15 px-3 py-2 rounded-xl">
          <input
            type="date"
            value={startDate}
            min={todayStr()}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm bg-transparent text-white border border-white/20 rounded px-2 py-1 outline-none"
          />
          <span className="text-white/40 text-sm">—</span>
          <input
            type="date"
            value={endDate}
            min={startDate || todayStr()}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm bg-transparent text-white border border-white/20 rounded px-2 py-1 outline-none"
          />
          <Button size="sm" onClick={handleRepeat} disabled={isRepeating}
            className="h-7 text-xs bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold">
            {isRepeating ? <Loader2 className="h-3 w-3 animate-spin" /> : "OK"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowRepeatForm(false)}
            className="h-7 text-xs text-white/50 hover:text-white">
            ✕
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={!isCourseEnded}
          title={isCourseEnded ? undefined : "Курс ще не завершився"}
          onClick={() => { setShowRepeatForm(true); setShowDeleteConfirm(false); }}
          className="flex items-center gap-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className="h-3 w-3" />
          Повторити
        </Button>
      )}

      {showDeleteConfirm ? (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
          <span className="text-sm text-red-400">Видалити?</span>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isDeleting}
            className="h-7 text-xs">
            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Так"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}
            className="h-7 text-xs text-white/50 hover:text-white">
            Ні
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowDeleteConfirm(true); setShowRepeatForm(false); }}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-400/50 hover:bg-red-500/10"
        >
          <Trash2 className="h-3 w-3" />
          Видалити
        </Button>
      )}
    </div>
  );
};

export default CourseActions;
