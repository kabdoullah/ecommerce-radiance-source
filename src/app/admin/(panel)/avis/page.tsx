import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/features/auth/session";
import { ReviewModeration } from "@/features/reviews/components/review-moderation";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Avis clients" };

const TABS = {
  pending: "À relire",
  approved: "Publiés",
  hidden: "Masqués",
} as const;

type ReviewStatus = keyof typeof TABS;

export default async function AdminReviewsPage({ searchParams }: PageProps<"/admin/avis">) {
  const raw = await searchParams;
  const status: ReviewStatus =
    typeof raw.statut === "string" && raw.statut in TABS
      ? (raw.statut as ReviewStatus)
      : "pending";

  const { supabase } = await requireAdmin();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, author_name, rating, comment, status, created_at, product:products(name)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Lecture des avis impossible : ${error.message}`);

  return (
    <>
      <PageHeader
        title="Avis clients"
        description="Les avis envoyés depuis les fiches produits n'apparaissent sur la boutique qu'une fois publiés."
      />

      <nav aria-label="Filtrer les avis" className="mb-6 flex flex-wrap gap-2">
        {Object.entries(TABS).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/avis?statut=${value}`}
            aria-current={status === value ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              status === value ? "bg-cocoa text-white" : "bg-surface hover:bg-mist"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {reviews.length === 0 ? (
        <p className="rounded-card bg-surface p-8 text-center text-ink-soft">
          Aucun avis dans cette liste.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-card border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <p>
                  <span className="font-semibold">{review.author_name}</span>
                  <span className="ml-2 text-caramel" aria-label={`${review.rating} sur 5`}>
                    {"★".repeat(review.rating)}
                    <span className="text-line">{"★".repeat(5 - review.rating)}</span>
                  </span>
                </p>
                <p className="text-ink-soft">{formatDateTime(review.created_at)}</p>
              </div>
              {review.product && (
                <p className="mt-1 text-sm text-ink-soft">Produit : {review.product.name}</p>
              )}
              <p className="mt-3 whitespace-pre-line">{review.comment}</p>
              <div className="mt-4">
                <ReviewModeration reviewId={review.id} status={review.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
