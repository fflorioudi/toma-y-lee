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
              height: "190px",
              objectFit: "cover",
              borderRadius: "14px",
              marginBottom: "0.85rem",
              border: "1px solid var(--border)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "190px",
              background: "var(--surface-soft)",
              borderRadius: "14px",
              marginBottom: "0.85rem",
              border: "1px solid var(--border)",
            }}
          />
        )}

        <h3
          style={{
            marginTop: 0,
            marginBottom: "0.35rem",
            fontSize: "1.05rem",
            lineHeight: 1.2,
            wordBreak: "normal",
            overflowWrap: "break-word",
          }}
        >
          {book.title}
        </h3>

        <p
          className="subtle-text"
          style={{
            marginTop: 0,
            wordBreak: "normal",
            overflowWrap: "break-word",
          }}
        >
          {book.author}
        </p>

        <p
          className="subtle-text"
          style={{
            marginTop: "0.5rem",
            wordBreak: "normal",
            overflowWrap: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {book.description || "Sin descripción."}
        </p>

        <p
          className="subtle-text"
          style={{ marginTop: "0.6rem", marginBottom: 0 }}
        >
          👁 {views} vista{views === 1 ? "" : "s"}
        </p>

        <div
          className="actions-row"
          style={{ marginTop: "0.8rem", gap: "0.5rem" }}
        >
          {book.pdf_url && <span className="badge">PDF</span>}
          {book.external_link && <span className="badge">Link</span>}
          {book.audio_url && <span className="badge">Audio</span>}
        </div>
      </article>
    </Link>
  );
}

function SectionHeader({
  title,
  description,
  href,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
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
      <div style={{ minWidth: 0 }}>
        <h2
          className="section-title"
          style={{
            fontSize: "1.85rem",
            color: "var(--accent)",
            marginBottom: "0.35rem",
            wordBreak: "normal",
            overflowWrap: "break-word",
          }}
        >
          {title}
        </h2>

        <p
          className="subtle-text"
          style={{
            marginTop: 0,
            wordBreak: "normal",
            overflowWrap: "break-word",
          }}
        >
          {description}
        </p>
      </div>

      <Link href={href} className="secondary-link">
        {linkText}
      </Link>
    </div>
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
    .limit(4);

  const latestBooks = (latestBooksData || []) as BookCard[];
  const mostViewedBooks = (mostViewedBooksData || []) as BookCard[];

  return (
    <main className="page-container">
      <section
        className="card"
        style={{
          padding: "2rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.65rem",
                color: "var(--accent)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.85rem",
              }}
            >
              TOMA.LEE.CRECE
            </p>

            <h1
              className="display-title"
              style={{
                margin: 0,
                textAlign: "left",
                fontSize: "clamp(2.4rem, 10vw, 4.2rem)",
                lineHeight: 1.05,
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Toma y lee
            </h1>

            <p
              className="section-subtitle"
              style={{
                margin: "1rem 0 0",
                maxWidth: "680px",
                textAlign: "left",
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Biblioteca online colaborativa. Un lugar para compartir libros,
              reseñas y lecturas que acompañen la fe, la formación y la
              interioridad.
            </p>

            <div className="actions-row top-space">
              <Link href="/catalogo" className="primary-link">
                Explorar catálogo
              </Link>

              <Link href="/publicar" className="secondary-link">
                Compartir un libro
              </Link>

              <Link href="/sobre" className="secondary-link">
                Conocer el proyecto
              </Link>
            </div>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "24px",
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              minWidth: 0,
            }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--accent)",
                fontWeight: 700,
              }}
            >
              Una biblioteca para caminar
            </p>

            <p
              className="subtle-text"
              style={{
                marginBottom: 0,
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Encontrá libros, guardá favoritos, marcá tus lecturas y compartí
              lo que te ayudó.
            </p>
          </div>
        </div>
      </section>

      <section className="top-space">
        <RandomBook />
      </section>

      <section className="top-space-lg">
        <SectionHeader
          title="Últimos libros compartidos"
          description="Lo más reciente que la comunidad sumó a la biblioteca."
          href="/catalogo"
          linkText="Ver catálogo"
        />

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
        <SectionHeader
          title="Más vistos por la comunidad"
          description="Lecturas que otros estuvieron explorando últimamente."
          href="/catalogo?order=most_viewed"
          linkText="Ver más vistos"
        />

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
            padding: "1.6rem",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "760px", minWidth: 0 }}>
            <h2
              style={{
                marginTop: 0,
                color: "var(--accent)",
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              ¿Qué es Toma y lee?
            </h2>

            <p
              className="subtle-text"
              style={{
                marginBottom: 0,
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Un espacio para reunir libros, PDFs, audiolibros y recursos que
              ayuden a leer, escuchar, compartir y crecer en comunidad.
            </p>
          </div>

          <Link href="/sobre" className="secondary-link">
            Conocer más
          </Link>
        </div>
      </section>
    </main>
  );
}