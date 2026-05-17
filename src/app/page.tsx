import Link from "next/link";
import RandomBook from "@/components/RandomBook";
import { createClient } from "@/lib/supabase/server";

type BookCard = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  external_link: string | null;
  audio_url: string | null;
  view_count: number | null;
};

function BookCardItem({ book }: { book: BookCard }) {
  const views = book.view_count ?? 0;

  return (
    <Link
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
              marginBottom: "0.9rem",
              border: "1px solid var(--border)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "220px",
              background: "var(--surface-soft)",
              borderRadius: "14px",
              marginBottom: "0.9rem",
              border: "1px solid var(--border)",
            }}
          />
        )}

        <h3 style={{ marginTop: 0, marginBottom: "0.35rem" }}>
          {book.title}
        </h3>

        <p className="subtle-text" style={{ marginTop: 0 }}>
          {book.author}
        </p>

        <p className="subtle-text" style={{ marginTop: "0.5rem" }}>
          {book.description?.slice(0, 110) || "Sin descripción."}
        </p>

        <p className="subtle-text" style={{ marginTop: "0.6rem", marginBottom: 0 }}>
          👁 {views} vista{views === 1 ? "" : "s"}
        </p>

        <div
          className="actions-row"
          style={{ marginTop: "0.9rem", gap: "0.5rem" }}
        >
          {book.pdf_url && <span className="badge">PDF</span>}
          {book.external_link && <span className="badge">Link</span>}
          {book.audio_url && <span className="badge">Audio</span>}
        </div>
      </article>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: latestBooksData } = await supabase
    .from("books")
    .select(
      "id, title, author, description, cover_url, pdf_url, external_link, audio_url, view_count"
    )
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: mostViewedBooksData } = await supabase
    .from("books")
    .select(
      "id, title, author, description, cover_url, pdf_url, external_link, audio_url, view_count"
    )
    .eq("is_hidden", false)
    .order("view_count", { ascending: false })
    .limit(3);

  const latestBooks = (latestBooksData || []) as BookCard[];
  const mostViewedBooks = (mostViewedBooksData || []) as BookCard[];

  return (
    <main className="page-container">
      <section className="hero-section">
        <h1 className="display-title">Toma y lee</h1>

        <p className="section-subtitle" style={{ margin: "1.2rem auto 0" }}>
          Biblioteca online colaborativa. Un lugar para compartir libros,
          reseñas y lecturas que acompañen la fe, la formación y la interioridad.
        </p>

        <div className="actions-row hero-actions top-space">
          <Link href="/catalogo" className="primary-link">
            Explorar catálogo
          </Link>

          <Link href="/publicar" className="secondary-link">
            Compartir un libro
          </Link>
        </div>

        <div
          className="hero-band"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            alignItems: "center",
          }}
        >
          <span>«Una sola alma y un solo corazón dirigidos hacia Dios».</span>
          <strong style={{ letterSpacing: "0.12em" }}>TOMA.LEE.CRECE</strong>
        </div>
      </section>

      <section className="top-space-lg">
        <RandomBook />
      </section>

      <section className="top-space-lg">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "end",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2
              className="section-title"
              style={{ fontSize: "2rem", color: "var(--accent)" }}
            >
              Últimos libros compartidos
            </h2>
            <p className="subtle-text" style={{ marginTop: 0 }}>
              Lo más reciente que la comunidad sumó a la biblioteca.
            </p>
          </div>

          <Link href="/catalogo" className="secondary-link">
            Ver catálogo
          </Link>
        </div>

        {latestBooks.length === 0 ? (
          <div className="card">
            <p className="empty-state" style={{ margin: 0 }}>
              Todavía no hay libros compartidos.
            </p>
          </div>
        ) : (
          <div className="grid-auto">
            {latestBooks.map((book) => (
              <BookCardItem key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="top-space-lg">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "end",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2
              className="section-title"
              style={{ fontSize: "2rem", color: "var(--accent)" }}
            >
              Más vistos por la comunidad
            </h2>
            <p className="subtle-text" style={{ marginTop: 0 }}>
              Lecturas que otros estuvieron explorando últimamente.
            </p>
          </div>

          <Link href="/catalogo?order=most_viewed" className="secondary-link">
            Ver más vistos
          </Link>
        </div>

        {mostViewedBooks.length === 0 ? (
          <div className="card">
            <p className="empty-state" style={{ margin: 0 }}>
              Todavía no hay vistas registradas.
            </p>
          </div>
        ) : (
          <div className="grid-auto">
            {mostViewedBooks.map((book) => (
              <BookCardItem key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="top-space-lg">
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Qué es Toma y lee?
          </h2>

          <p
            className="subtle-text"
            style={{
              maxWidth: "720px",
              margin: "0.75rem auto 1.25rem",
            }}
          >
            Un espacio para reunir libros, PDFs, audiolibros y recursos que
            ayuden a leer, escuchar, compartir y crecer en comunidad.
          </p>

          <Link href="/sobre" className="secondary-link">
            Conocer más
          </Link>
        </div>
      </section>
    </main>
  );
}