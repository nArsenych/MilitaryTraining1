"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AdminDeleteReviewButton = ({ reviewId }: { reviewId: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Видалити відгук? Ця дія незворотна.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Відгук видалено");
      router.refresh();
    } catch {
      toast.error("Помилка видалення відгуку");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 text-[10px] text-white/25 hover:text-red-400 transition-colors disabled:opacity-50"
      title="Видалити відгук"
    >
      {loading ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
      Видалити
    </button>
  );
};

export default AdminDeleteReviewButton;
