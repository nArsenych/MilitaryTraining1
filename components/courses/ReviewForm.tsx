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
    <div className="bg-[#F1CDA6] rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-2">Залишити відгук</h3>
      <div className="flex items-center gap-3 mb-3">
        <StarRating rating={rating} onRate={setRating} size={24} />
        <span className="text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : "Оберіть оцінку"}
        </span>
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Коментар (необов'язково)"
        rows={3}
        className="mb-3"
      />
      <Button onClick={handleSubmit} disabled={isLoading || rating === 0} size="sm">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
        Надіслати відгук
      </Button>
    </div>
  );
};

export default ReviewForm;