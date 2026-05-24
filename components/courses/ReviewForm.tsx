"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ReviewForm = ({ courseId }: { courseId: string }) => {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Оберіть оцінку");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`/api/courses/${courseId}/reviews`, {
        rating,
        comment: comment.trim() || null,
      });
      toast.success("Відгук додано!");
      setRating(0);
      setComment("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Помилка збереження відгуку");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#3D3A36] border border-white/8 px-4 py-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Ваш відгук</p>
      <div className="flex items-center gap-3">
        <StarRating rating={rating} onRate={setRating} size={22} />
        <span className="text-sm text-white/40">
          {rating > 0 ? `${rating} / 5` : "Оберіть оцінку"}
        </span>
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Коментар (необов'язково)"
        rows={3}
        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#FDAB04]/50 resize-none"
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading || rating === 0}
        size="sm"
        className="bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold w-fit"
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
        Надіслати відгук
      </Button>
    </div>
  );
};

export default ReviewForm;
