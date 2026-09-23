import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types/product";

const STAR_VALUES = [5, 4, 3, 2, 1];

/** "Layla Young" → "LY" */
function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={cn(
            "size-3.5",
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-line text-line",
          )}
        />
      ))}
    </span>
  );
}

/** Average plus a bar per star value (5★ … 1★). */
function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-3xl font-semibold tabular-nums">{average.toFixed(1)}</p>
      <Stars rating={Math.round(average)} />
      <p className="mt-1 text-xs text-fg-subtle">
        {reviews.length} review{reviews.length === 1 ? "" : "s"}
      </p>
      <dl className="mt-4 space-y-1.5">
        {STAR_VALUES.map((star) => {
          const count = reviews.filter((review) => review.rating === star).length;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <dt className="w-6 text-fg-muted tabular-nums">{star}★</dt>
              <dd className="flex flex-1 items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </span>
                <span className="w-4 text-right text-fg-subtle tabular-nums">{count}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-fg-subtle">No reviews yet.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <RatingDistribution reviews={reviews} />
      <ul className="grid content-start gap-3 md:grid-cols-2">
        {reviews.map((review) => (
          <li
            key={`${review.reviewerEmail}-${review.date}-${review.comment}`}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Stars rating={review.rating} />
              <time dateTime={review.date} className="text-xs text-fg-subtle">
                {formatDate(review.date)}
              </time>
            </div>
            <p className="mt-3 text-sm">“{review.comment}”</p>
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-fg-muted">
              <span
                aria-hidden
                className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent"
              >
                {initials(review.reviewerName)}
              </span>
              {review.reviewerName}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
