import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/ReviewForm";
import ReportBookButton from "@/components/ReportBookButton";
import ReportReviewButton from "@/components/ReportReviewButton";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Book = {
  id: string;
  user_id: string | null;
  title: string;
  author: string;
  description: string | null;
  featured_quote: string | null;
  external_link: string | null;
  pdf_url: string | null;
  cover_url: string | null;
};

type ReviewRow = {
  id: string;
  user_id: string | null;
  review_text: string | null;
  rating: number | null;
  created_at: string;
  is_hidden: boolean;
};

type ProfileRow = {
  id: string;
  name: string | null;
  last_name: string | null;
};

type ReviewWithUser = ReviewRow & {
  reviewer_name: string;
};

function calcularPromedio(reviews: ReviewWithUser[]) {
  const ratings = reviews
    .map((review) => review.rating)
    .filter((rating): rating is number => rating !== null);

  if (ratings.length === 0) return null;

  const total = ratings.reduce((acc, rating) => acc + rating, 0);
  return (total / ratings.length).toFixed(1);
}

function getFullName(profile?: ProfileRow | null) {
  if (!profile) return "Usuario";
  const fullName = `${profile.name || ""} ${profile.last_name || ""}`.trim();
  return fullName || "Usuario";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function LibroDetallePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select(
      "id, user_id, title, author, description, featured_quote, external_link, pdf_url, cover_url"
    )
    .eq("id", id)
    .eq("is_hidden", false)
    .single();

  if (bookError || !book) {
    notFound();
  }

  const typedBook = book as Book;

  let uploaderProfile: ProfileRow | null = null;

  if (typedBook.user_id) {
    const { data: uploaderData } = await supabase
      .from("users_profile")
      .select("id, name, last_name")
      .eq("id", typedBook.user_id)
      .single();

    uploaderProfile = (uploaderData || null) as ProfileRow | null;
  }

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, user_id, review_text, rating, created_at, is_hidden")
    .eq("book_id", id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  const typedReviews = (reviewsData || []) as ReviewRow[];

  const userIds = typedReviews
    .map((review) => review.user_id)
    .filter((uid): uid is string => !!uid);

  let profilesMap = new Map<string, string>();

  if (userIds.length > 0) {
    const uniqueUserIds = [...new Set(userIds)];

    const { data: profilesData } = await supabase
      .from("users_profile")
      .select("id, name, last_name")
      .in("id", uniqueUserIds);

    const typedProfiles = (profilesData || []) as ProfileRow[];

    profilesMap = new Map(
      typedProfiles.map((profile) => {
        const fullName = `${profile.name || ""} ${profile.last_name || ""}`.trim();
        return [profile.id, fullName || "Usuario"];
      })
    );
  }

  const reviewsWithUser: ReviewWithUser[] = typedReviews.map((review) => ({
    ...review,
    reviewer_name: review.user_id
      ? profilesMap.get(review.user_id) || "Usuario"
      : "Usuario",
  }));

  const promedio = calcularPromedio(reviewsWithUser);
  const reviewsCount = reviewsWithUser.length;

  return (
    <main className="page-container">
      <Link
        href="/catalogo"
        className="secondary-link"
        style={{ marginBottom: "1rem" }}
      >
        ← Volver al catálogo
      </Link>

      <section className="card top-space">
        <div className="grid-2">
          <div>
            {typedBook.cover_url ? (
              <img
                src={typedBook.cover_url}
                alt={typedBook.title}
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  borderRadius: "16px",
                  objectFit: "cover",
                  border: "1px solid var(--border)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  height: "430px",
                  background: "var(--surface-soft)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                }}
              />
            )}
          </div>

          <div>
            <h1
              className="section-title"
              style={{ marginBottom: "0.6rem", color: "var(--text)" }}
            >
              {typedBook.title}
            </h1>

            <p style={{ fontSize: "1.08rem", marginTop: 0 }}>
              <strong>Autor:</strong> {typedBook.author}
            </p>

            <p className="subtle-text" style={{ marginTop: "0.5rem" }}>
              <strong>Subido por:</strong> {getFullName(uploaderProfile)}
            </p>

            <p
              style={{
                marginTop: "0.9rem",
                fontSize: "1rem",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              {promedio
                ? `⭐ ${promedio}/5 · ${reviewsCount} reseña${reviewsCount === 1 ? "" : "s"}`
                : "Sin reseñas todavía"}
            </p>

            <div className="top-space">
              <h2 style={{ marginBottom: "0.5rem" }}>Descripción</h2>
              <p className="subtle-text">
                {typedBook.description || "Sin descripción."}
              </p>
            </div>

            {typedBook.featured_quote && (
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem 1.1rem",
                  background: "var(--surface-soft)",
                  borderLeft: "4px solid var(--accent)",
                  borderRadius: "12px",
                }}
              >
                <strong>Frase destacada</strong>
                <p
                  style={{
                    marginTop: "0.5rem",
                    marginBottom: 0,
                    color: "var(--text-soft)",
                    fontStyle: "italic",
                  }}
                >
                  “{typedBook.featured_quote}”
                </p>
              </div>
            )}

            <div className="actions-row top-space">
              {typedBook.external_link && (
                <a
                  href={typedBook.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-link"
                >
                  Ir al link
                </a>
              )}

              {typedBook.pdf_url && (
                <a
                  href={typedBook.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-link"
                >
                  Ver PDF
                </a>
              )}

              <ReportBookButton bookId={typedBook.id} />
            </div>
          </div>
        </div>
      </section>

      <section className="top-space-lg">
        <h2 className="section-title" style={{ fontSize: "2rem", color: "var(--accent)" }}>
          Reseñas
        </h2>

        {reviewsWithUser.length === 0 ? (
          <div className="card">
            <p className="empty-state" style={{ margin: 0 }}>
              Todavía no hay reseñas para este libro. Podés ser la primera persona en compartir una.
            </p>
          </div>
        ) : (
          <div className="list-stack">
            {reviewsWithUser.map((review) => (
              <article key={review.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "0.5rem",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>{review.reviewer_name}</strong>
                  </p>

                  <p className="subtle-text" style={{ margin: 0 }}>
                    {review.rating ?? "-"} / 5 · {formatDate(review.created_at)}
                  </p>
                </div>

                <p className="subtle-text" style={{ marginBottom: 0 }}>
                  {review.review_text || "Sin texto."}
                </p>

                <div style={{ marginTop: "0.9rem" }}>
                  <ReportReviewButton reviewId={review.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="top-space-lg">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Dejar una reseña</h2>
          <ReviewForm bookId={typedBook.id} />
        </div>
      </section>
    </main>
  );
}