import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "@/components/ReviewForm";
import ReportBookButton from "@/components/ReportBookButton";
import ReportReviewButton from "@/components/ReportReviewButton";
import FavoriteButton from "@/components/FavoriteButton";
import BookViewTracker from "@/components/BookViewTracker";

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
  audio_url: string | null;
  pdf_url: string | null;
  cover_url: string | null;
  category_id: string | null;
  view_count: number;
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

function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    let videoId: string | null = null;
    let playlistId: string | null = null;

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
        playlistId = parsed.searchParams.get("list");
      } else if (parsed.pathname === "/playlist") {
        playlistId = parsed.searchParams.get("list");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || null;
      }
    }

    if (host === "youtu.be") {
      videoId = parsed.pathname.replace("/", "").split("/")[0] || null;
      playlistId = parsed.searchParams.get("list");
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (playlistId) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    }

    return null;
  } catch {
    return null;
  }
}

function getSpotifyEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host !== "open.spotify.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const validTypes = [
      "track",
      "episode",
      "show",
      "playlist",
      "album",
      "artist",
    ];

    const contentType = parts[0];
    const contentId = parts[1];

    if (!validTypes.includes(contentType) || !contentId) return null;

    return `https://open.spotify.com/embed/${contentType}/${contentId}`;
  } catch {
    return null;
  }
}

export default async function LibroDetallePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select(
      "id, user_id, title, author, description, featured_quote, external_link, audio_url, pdf_url, cover_url, category_id, view_count"
    )
    .eq("id", id)
    .eq("is_hidden", false)
    .single();

  if (bookError || !book) {
    notFound();
  }

  const typedBook = book as Book;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(typedBook.audio_url);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(typedBook.audio_url);
  const hasEmbeddedAudio = !!youtubeEmbedUrl || !!spotifyEmbedUrl;

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

  let relatedBooks: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
  }[] = [];

  if (typedBook.category_id) {
    const { data: relatedData } = await supabase
      .from("books")
      .select("id, title, author, cover_url")
      .eq("is_hidden", false)
      .eq("category_id", typedBook.category_id)
      .neq("id", typedBook.id)
      .limit(4);

    relatedBooks = relatedData || [];
  }

  let initialIsFavorite = false;

  if (user) {
    const { data: favoriteData } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", typedBook.id)
      .maybeSingle();

    initialIsFavorite = !!favoriteData;
  }

  return (
    <main className="page-container">
      <BookViewTracker bookId={typedBook.id} />

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
                  margin: "0 auto",
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
                  margin: "0 auto",
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
                ? `⭐ ${promedio}/5 · ${reviewsCount} reseña${
                    reviewsCount === 1 ? "" : "s"
                  }`
                : "Sin reseñas todavía"}
            </p>

            <p className="subtle-text" style={{ marginTop: "0.35rem" }}>
              👁 {typedBook.view_count ?? 0} vista
              {typedBook.view_count === 1 ? "" : "s"}
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

              {typedBook.audio_url && !hasEmbeddedAudio && (
                <a
                  href={typedBook.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-link"
                >
                  Escuchar audiolibro
                </a>
              )}

              <FavoriteButton
                bookId={typedBook.id}
                initialIsFavorite={initialIsFavorite}
              />

              <ReportBookButton bookId={typedBook.id} />
            </div>

            {youtubeEmbedUrl && (
              <div className="top-space">
                <h2 style={{ marginBottom: "0.75rem" }}>Escuchalo acá</h2>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    background: "var(--surface-soft)",
                  }}
                >
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`Audiolibro de ${typedBook.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </div>

                <div style={{ marginTop: "0.9rem" }}>
                  <a
                    href={typedBook.audio_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-link"
                  >
                    Abrir en YouTube
                  </a>
                </div>
              </div>
            )}

            {spotifyEmbedUrl && (
              <div className="top-space">
                <h2 style={{ marginBottom: "0.75rem" }}>Escuchalo acá</h2>

                <div
                  style={{
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    background: "var(--surface-soft)",
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src={spotifyEmbedUrl}
                    title={`Audio de Spotify de ${typedBook.title}`}
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{
                      border: 0,
                      display: "block",
                    }}
                  />
                </div>

                <div style={{ marginTop: "0.9rem" }}>
                  <a
                    href={typedBook.audio_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-link"
                  >
                    Abrir en Spotify
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="top-space-lg">
        <h2
          className="section-title"
          style={{ fontSize: "2rem", color: "var(--accent)" }}
        >
          Reseñas
        </h2>

        {reviewsWithUser.length === 0 ? (
          <div className="card">
            <p className="empty-state" style={{ margin: 0 }}>
              Todavía no hay reseñas para este libro. Podés ser la primera
              persona en compartir una.
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

      <section className="top-space-lg">
        <h2
          className="section-title"
          style={{ fontSize: "2rem", color: "var(--accent)" }}
        >
          También te puede interesar
        </h2>

        {relatedBooks.length === 0 ? (
          <div className="card">
            <p className="empty-state" style={{ margin: 0 }}>
              No encontramos más libros relacionados por ahora.
            </p>
          </div>
        ) : (
          <div className="grid-auto">
            {relatedBooks.map((book) => (
              <Link
                key={book.id}
                href={`/libro/${book.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article className="card card-hover" style={{ height: "100%" }}>
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "cover",
                        borderRadius: "14px",
                        border: "1px solid var(--border)",
                        marginBottom: "0.9rem",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        background: "var(--surface-soft)",
                        borderRadius: "14px",
                        border: "1px solid var(--border)",
                        marginBottom: "0.9rem",
                      }}
                    />
                  )}

                  <h3 style={{ marginTop: 0, marginBottom: "0.35rem" }}>
                    {book.title}
                  </h3>
                  <p className="subtle-text" style={{ marginTop: 0 }}>
                    {book.author}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}