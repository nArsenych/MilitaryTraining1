"use client"

import { useState } from "react"
import { CheckCircle, History } from "lucide-react"
import ReviewForm from "@/components/courses/ReviewForm"
import ReviewsList from "@/components/courses/ReviewsList"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  profile: { full_name: string | null; isOrganization: boolean }
}

interface CourseRun {
  id: string
  startDate: string
  endDate: string
}

interface CourseDetailTabsProps {
  courseId: string
  reviews: Review[]
  avgRating: number
  canReview: boolean
  hasReviewed: boolean
  runs: CourseRun[]
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })

const CourseDetailTabs = ({
  courseId,
  reviews,
  avgRating,
  canReview,
  hasReviewed,
  runs,
}: CourseDetailTabsProps) => {
  const [tab, setTab] = useState<"reviews" | "history">("reviews")

  return (
    <div className="border-t border-white/10 pt-6">
      {/* tab switcher */}
      <div className="flex gap-1 mb-6 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("reviews")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "reviews"
              ? "bg-[#FDAB04] text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          Відгуки
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "history"
              ? "bg-[#FDAB04] text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          Історія курсу
        </button>
      </div>

      {tab === "reviews" && (
        <div>
          {canReview && (
            <div className="mb-6">
              <ReviewForm courseId={courseId} />
            </div>
          )}
          {hasReviewed && (
            <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
              <CheckCircle size={14} />
              Ви вже оцінили цей курс
            </div>
          )}
          <ReviewsList reviews={reviews} avgRating={avgRating} count={reviews.length} />
        </div>
      )}

      {tab === "history" && (
        <div>
          {runs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <History size={32} className="text-white/15" />
              <p className="text-white/30 text-sm">Цей курс проводився вперше</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {runs.map((run, i) => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/8"
                >
                  <div className="p-1.5 rounded-lg bg-[#FDAB04]/10 shrink-0">
                    <History size={13} className="text-[#FDAB04]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                      Проведення №{runs.length - i}
                    </p>
                    <p className="text-sm font-medium text-white">
                      {fmt(run.startDate)} — {fmt(run.endDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseDetailTabs
