import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminBookActions from "@/components/AdminBookActions";
import AdminReviewActions from "@/components/AdminReviewActions";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ProfileRow = {
  id: string;
  name: string | null;
  last_name: string | null;
};

type ReviewRow = {
  id: string;
  user_id: string | null;
  review_text: string | null;
  rating: number | null;
  is_hidden: boolean;
  created_at: string;
};

type BookReportRow = {
  id: string;
  user_id: string | null;
  reason: string | null;
  created_at: string;
};

type ReviewReportRow = {
  id: string;
  review_id: string | null;
  user_id: string | null;
  reason: string | null;
  created_at: string;
};

function getFullName(profile?: ProfileRow) {
  if (!profile) return "Usuario";
  const fullName = `${profile.name || ""} ${profile.last_name || ""}`.trim();
  return fullName || "Usuario";
}

export default async function AdminBookPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) notFound();

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, user_id, review_text, rating, is_hidden, created_at")
    .eq("book_id", id)
    .order("created_at", { ascending: false });

  const { data: bookReportsData } = await supabase
    .from("book_reports")
    .select("id, user_id, reason, created_at")
    .eq("book_id", id)
    .order("created_at", { ascending: false });

  const { data: reviewReportsData } = await supabase
    .from("review_reports")
    .select("id, review_id, user_id, reason, created_at")
    .order("created_at", { ascending: false });

  const reviews = (reviewsData || []) as ReviewRow[];
  const bookReports = (bookReportsData || []) as BookReportRow[];
  const allReviewReports = (reviewReportsData || []) as ReviewReportRow[];

  const reviewIds = new Set(reviews.map((r) => r.id));
  const reviewReports = allReviewReports.filter(
    (report) => report.review_id && reviewIds.has(report.review_id)
  );

  const userIds = [
    ...new Set(
      [
        ...reviews.map((r) => r.user_id),
        ...bookReports.map((r) => r.user_id),
        ...reviewReports.map((r) => r.user_id),
      ].filter((uid): uid is string => !!uid)
    ),
  ];

  let profilesMap = new Map<string, ProfileRow>();

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("users_profile")
      .select("id, name, last_name")
      .in("id", userIds);

    const profiles = (profilesData || []) as ProfileRow[];
    profilesMap = new Map(profiles.map((p) => [p.id, p]));
  }

  const reviewsMap = new Map(reviews.map((review) => [review.id, review]));

  return (
    <main className="page-container">
      <Link href="/admin" className="secondary-link" style={{ marginBottom: "1rem" }}>
        ← Volver al panel admin
      </Link>

      <section className="card top-space">
        <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>
          Gestionar libro
        </h1>

        <h2 style={{ marginTop: 0, marginBottom: "0.35rem", wordBreak: "break-word" }}>
          {book.title}
        </h2>
        <p className="subtle-text" style={{ marginTop: 0 }}>
          {book.author}
        </p>

        <p>
          <strong>Estado:</strong>{" "}
          <span style={{ color: book.is_hidden ? "var(--accent)" : "var(--text)" }}>
            {book.is_hidden ? "Oculto" : "Visible"}
          </span>
        </p>

        <div className="actions-row" style={{ marginTop: "1rem" }}>
          <AdminBookActions bookId={book.id} isHidden={book.is_hidden} />

          <Link href={`/libro/${book.id}`} className="secondary-link">
            Ver libro
          </Link>
        </div>
      </section>

      <section className="top-space-lg">
        <h2 className="section-title" style={{ fontSize: "2rem", color: "var(--accent)" }}>
          Reseñas
        </h2>

        {reviews.length === 0 ? (
          <p className="empty-state">No hay reseñas.</p>
        ) : (
          <div className="list-stack">
            {reviews.map((review) => {
              const reviewer = review.user_id
                ? getFullName(profilesMap.get(review.user_id))
                : "Usuario";

              const reportCount = reviewReports.filter(
                (report) => report.review_id === review.id
              ).length;

              return (
                <article key={review.id} className="card">
                  <p style={{ marginTop: 0 }}>
                    <strong>Usuario:</strong> {reviewer}
                  </p>
                  <p>
                    <strong>Puntaje:</strong> {review.rating ?? "-"}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {review.is_hidden ? "Oculta" : "Visible"}
                  </p>
                  <p>
                    <strong>Reportes:</strong> {reportCount}
                  </p>
                  <p className="subtle-text" style={{ marginTop: "0.7rem" }}>
                    {review.review_text || "Sin texto."}
                  </p>

                  <div style={{ marginTop: "1rem" }}>
                    <AdminReviewActions
                      reviewId={review.id}
                      isHidden={review.is_hidden}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="top-space-lg">
        <h2 className="section-title" style={{ fontSize: "2rem", color: "var(--accent)" }}>
          Reportes del libro
        </h2>

        {bookReports.length === 0 ? (
          <p className="empty-state">No hay reportes.</p>
        ) : (
          <div className="list-stack">
            {bookReports.map((report) => {
              const reporter = report.user_id
                ? getFullName(profilesMap.get(report.user_id))
                : "Usuario";

              return (
                <article key={report.id} className="card">
                  <p style={{ marginTop: 0 }}>
                    <strong>Reportado por:</strong> {reporter}
                  </p>
                  <p>
                    <strong>Motivo:</strong> {report.reason || "Sin motivo"}
                  </p>

                  <div style={{ marginTop: "1rem" }}>
                    <AdminBookActions bookId={book.id} isHidden={book.is_hidden} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="top-space-lg">
        <h2 className="section-title" style={{ fontSize: "2rem", color: "var(--accent)" }}>
          Reportes de reseñas
        </h2>

        {reviewReports.length === 0 ? (
          <p className="empty-state">No hay reportes.</p>
        ) : (
          <div className="list-stack">
            {reviewReports.map((report) => {
              const reporter = report.user_id
                ? getFullName(profilesMap.get(report.user_id))
                : "Usuario";

              const relatedReview = report.review_id
                ? reviewsMap.get(report.review_id)
                : undefined;

              return (
                <article key={report.id} className="card">
                  <p style={{ marginTop: 0 }}>
                    <strong>Reportado por:</strong> {reporter}
                  </p>
                  <p>
                    <strong>Motivo:</strong> {report.reason || "Sin motivo"}
                  </p>
                  <p style={{ marginBottom: "0.35rem" }}>
                    <strong>Reseña reportada:</strong>
                  </p>
                  <p className="subtle-text">
                    {relatedReview?.review_text || "No se encontró la reseña."}
                  </p>

                  {relatedReview && (
                    <div style={{ marginTop: "1rem" }}>
                      <AdminReviewActions
                        reviewId={relatedReview.id}
                        isHidden={relatedReview.is_hidden}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}