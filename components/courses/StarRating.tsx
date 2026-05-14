"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

const StarRating = ({ rating, onRate, size = 20, readonly = false }: StarRatingProps) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-400"
          } ${!readonly ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => !readonly && onRate?.(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;