"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface CourseActionsProps {
  courseId: string;
  courseTitle: string;
}

const CourseActions = ({ courseId, courseTitle }: CourseActionsProps) => {
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

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Дата початку має бути раніше дати закінчення");
      return;
    }

    setIsRepeating(true);
    try {
      const res = await axios.post(`/api/courses/${courseId}/repeat`, {
        startDate,
        endDate,
      });
      toast.success("Курс повторено! Перейдіть до редагування.");
      router.push(`/instructor/courses/${res.data.id}/basic`);
    } catch {
      toast.error("Помилка повторення курсу");
    } finally {
      setIsRepeating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Повторити */}
      {!showRepeatForm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowRepeatForm(true); setShowDeleteConfirm(false); }}
          className="flex items-center gap-1"
        >
          <Copy className="h-3 w-3" />
          Повторити
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-[#F1CDA6] p-2 rounded-lg">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          />
          <span className="text-sm">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          />
          <Button size="sm" onClick={handleRepeat} disabled={isRepeating}>
            {isRepeating ? <Loader2 className="h-3 w-3 animate-spin" /> : "OK"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowRepeatForm(false)}>
            ✕
          </Button>
        </div>
      )}

      {/* Видалити */}
      {!showDeleteConfirm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowDeleteConfirm(true); setShowRepeatForm(false); }}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
          Видалити
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg">
          <span className="text-sm text-red-700">Видалити &quot;{courseTitle}&quot;?</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Так"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Ні
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseActions;