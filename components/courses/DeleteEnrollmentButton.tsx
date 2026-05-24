"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteEnrollmentButtonProps {
  courseId: string;
  courseTitle: string;
}

const DeleteEnrollmentButton = ({ courseId, courseTitle }: DeleteEnrollmentButtonProps) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Помилка скасування запису");
        return;
      }
      toast.success("Запис скасовано");
      router.refresh();
    } catch {
      toast.error("Щось пішло не так");
    } finally {
      setIsDeleting(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors mt-3"
      >
        <Trash2 size={13} />
        Скасувати запис
      </button>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xs text-white/50">Скасувати запис на «{courseTitle}»?</span>
      <Button
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
      >
        {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Так"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setConfirming(false)}
        className="h-7 px-3 text-xs text-white/40 hover:text-white"
      >
        Ні
      </Button>
    </div>
  );
};

export default DeleteEnrollmentButton;
