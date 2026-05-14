import StarRating from "@/components/courses/StarRating";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  profile: {
    full_name: string | null;
    isOrganization: boolean;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  avgRating: number;
  count: number;
}

const ReviewsList = ({ reviews, avgRating, count }: ReviewsListProps) => {
  if (count === 0) {
    return (
      <div className="text-gray-400 text-sm py-4">
        Поки немає відгуків
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <StarRating rating={Math.round(avgRating)} readonly size={22} />
        <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
        <span className="text-sm text-gray-400">({count} {count === 1 ? "відгук" : count < 5 ? "відгуки" : "відгуків"})</span>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {review.profile.full_name || "Користувач"}
                </span>
                <StarRating rating={review.rating} readonly size={14} />
              </div>
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("uk-UA")}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;