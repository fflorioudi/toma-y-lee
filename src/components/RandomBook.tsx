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
        <h2 style={{ marginTop: 0 }}>No sé qué leer</h2>
        <p className="empty-state">Todavía no hay libros cargados.</p>
      </section>
    );
  }

  const randomIndex = Math.floor(Math.random() * books.length);
  const book = books[randomIndex] as Book;

  return (
    <section className="card">
      <h2 style={{ marginTop: 0, marginBottom: "0.3rem", color: "var(--accent)" }}>
        No sé qué leer
      </h2>

      <p className="subtle-text" style={{ marginTop: 0 }}>
        Te recomendamos esta lectura al azar.
      </p>

      <div
        className="grid-2"
        style={{ marginTop: "1rem", gridTemplateColumns: "190px 1fr" }}
      >
        <div>
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              style={{
                width: "100%",
                height: "275px",
                objectFit: "cover",
                borderRadius: "14px",
                border: "1px solid var(--border)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "275px",
                background: "var(--surface-soft)",
                borderRadius: "14px",
                border: "1px solid var(--border)",
              }}
            />
          )}
        </div>

        <div>
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>{book.title}</h3>
          <p style={{ marginTop: 0 }}>
            <strong>Autor:</strong> {book.author}
          </p>
          <p className="subtle-text">
            {book.description?.slice(0, 180) || "Sin descripción."}
          </p>

          <Link
            href={`/libro/${book.id}`}
            className="primary-link"
            style={{ marginTop: "1rem" }}
          >
            Ver libro
          </Link>
        </div>
      </div>
    </section>
  );
}