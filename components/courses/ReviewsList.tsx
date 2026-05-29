import StarRating from "@/components/courses/StarRating";
import ReviewComplaintButton from "@/components/courses/ReviewComplaintButton";
import AdminDeleteReviewButton from "@/components/courses/AdminDeleteReviewButton";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  profile: {
    full_name: string | null;
    isOrganization?: boolean;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  avgRating: number;
  count: number;
  isAdmin?: boolean;
  canComplainAboutReview?: boolean;
}

function reviewWord(count: number): string {
  if (count === 1) return "відгук";
  if (count < 5) return "відгуки";
  return "відгуків";
}

const ReviewsList = ({ reviews, avgRating, count, isAdmin, canComplainAboutReview }: ReviewsListProps) => {
  if (count === 0) {
    return (
      <p className="text-white/30 text-sm py-4">Поки немає відгуків</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/8 w-fit">
        <StarRating rating={Math.round(avgRating)} readonly size={18} />
        <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>
        <span className="text-white/40 text-xs">
          ({count} {reviewWord(count)})
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl bg-[#3D3A36] border border-white/8 px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium text-white">
                  {review.profile.full_name || "Користувач"}
                </span>
                <StarRating rating={review.rating} readonly size={13} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/30">
                  {new Date(review.createdAt).toLocaleDateString("uk-UA")}
                </span>
                {canComplainAboutReview && <ReviewComplaintButton reviewId={review.id} />}
                {isAdmin && <AdminDeleteReviewButton reviewId={review.id} />}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-white/60 leading-relaxed mt-1">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
