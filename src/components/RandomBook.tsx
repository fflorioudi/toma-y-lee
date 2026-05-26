import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
};

export default async function RandomBook() {
  const supabase = await createClient();

  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, author, description, cover_url")
    .eq("is_hidden", false);

  if (error || !books || books.length === 0) {
    return (
      <section className="card">
        <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
          No sé qué leer
        </h2>

        <p className="empty-state" style={{ marginBottom: 0 }}>
          Todavía no hay libros cargados.
        </p>
      </section>
    );
  }

  const randomIndex = Math.floor(Math.random() * books.length);
  const book = books[randomIndex] as Book;

  return (
    <section className="card">
      <div
        style={{
          display: "flex",
          gap: "1.25rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "140px",
            maxWidth: "100%",
            flex: "0 0 140px",
          }}
        >
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              style={{
                width: "100%",
                aspectRatio: "3 / 4",
                objectFit: "cover",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "3 / 4",
                background: "var(--surface-soft)",
                borderRadius: "14px",
                border: "1px solid var(--border)",
              }}
            />
          )}
        </div>

        <div
          style={{
            flex: "1 1 320px",
            minWidth: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--accent)",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            No sé qué leer
          </p>

          <h2
            style={{
              margin: "0.25rem 0 0.35rem",
              fontSize: "1.35rem",
              lineHeight: 1.15,
              wordBreak: "normal",
              overflowWrap: "break-word",
            }}
          >
            {book.title}
          </h2>

          <p
            style={{
              margin: 0,
              fontWeight: 600,
              wordBreak: "normal",
              overflowWrap: "break-word",
            }}
          >
            {book.author}
          </p>

          <p
            className="subtle-text"
            style={{
              marginTop: "0.55rem",
              marginBottom: 0,
              wordBreak: "normal",
              overflowWrap: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.description || "Sin descripción."}
          </p>

          <div className="actions-row" style={{ marginTop: "0.85rem" }}>
            <Link href={`/libro/${book.id}`} className="primary-link">
              Ver libro
            </Link>

            <Link href="/" className="secondary-link">
              Otro recomendado
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}