import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    order?: string;
    category?: string;
    minRating?: string;
  }>;
};

type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  external_link: string | null;
  category_id: string | null;
  categories:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
};

type Category = {
  id: string;
  name: string;
};

type ReviewRating = {
  book_id: string | null;
  rating: number | null;
};

function calcularEstadisticas(reviews: ReviewRating[]) {
  const map = new Map<string, { total: number; count: number }>();

  for (const review of reviews) {
    if (!review.book_id || review.rating === null) continue;

    const current = map.get(review.book_id) || { total: 0, count: 0 };
    current.total += review.rating;
    current.count += 1;
    map.set(review.book_id, current);
  }

  const stats = new Map<string, { average: number; count: number }>();

  for (const [bookId, data] of map.entries()) {
    stats.set(bookId, {
      average: data.total / data.count,
      count: data.count,
    });
  }

  return stats;
}

function getCategoryName(book: Book) {
  if (Array.isArray(book.categories)) {
    return book.categories[0]?.name || "Sin categoría";
  }

  return book.categories?.name || "Sin categoría";
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const q = params.q?.trim() || "";
  const type = params.type || "all";
  const order = params.order || "recent";
  const category = params.category || "all";
  const minRating = Number(params.minRating || "0");

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  const categories = (categoriesData || []) as Category[];

  let query = supabase
    .from("books")
    .select(`
      id,
      title,
      author,
      description,
      cover_url,
      pdf_url,
      external_link,
      category_id,
      categories (
        name
      )
    `)
    .eq("is_hidden", false);

  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  }

  if (type === "pdf") {
    query = query.not("pdf_url", "is", null);
  }

  if (type === "link") {
    query = query.not("external_link", "is", null);
  }

  if (category !== "all") {
    query = query.eq("category_id", category);
  }

  if (order === "title_asc") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: books, error } = await query;

  if (error) {
    return (
      <main className="page-container">
        <h1 className="section-title">Catálogo</h1>
        <p className="empty-state">Error al cargar los libros.</p>
      </main>
    );
  }

  const typedBooks = (books || []) as Book[];
  const bookIds = typedBooks.map((book) => book.id);

  let ratingsStatsMap = new Map<string, { average: number; count: number }>();

  if (bookIds.length > 0) {
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("book_id, rating")
      .in("book_id", bookIds)
      .eq("is_hidden", false);

    const typedReviews = (reviewsData || []) as ReviewRating[];
    ratingsStatsMap = calcularEstadisticas(typedReviews);
  }

  const filteredBooks = typedBooks.filter((book) => {
    if (minRating <= 0) return true;
    const stats = ratingsStatsMap.get(book.id);
    return stats !== undefined && stats.average >= minRating;
  });

  return (
    <main className="page-container">
      <section>
        <h1 className="section-title" style={{ color: "var(--accent)" }}>
          Catálogo
        </h1>
        <p className="subtle-text" style={{ marginTop: 0, maxWidth: "760px" }}>
          Explorá los libros compartidos por la comunidad y encontrá lecturas por
          categoría, formato y valoración.
        </p>
      </section>

      <section className="card top-space">
        <form method="GET" className="responsive-filter-grid">
          <div className="form-field">
            <label htmlFor="q">Buscar</label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Buscar por título o autor"
            />
          </div>

          <div className="form-field">
            <label htmlFor="type">Tipo</label>
            <select id="type" name="type" defaultValue={type}>
              <option value="all">Todos</option>
              <option value="pdf">Solo con PDF</option>
              <option value="link">Solo con link</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="category">Categoría</label>
            <select id="category" name="category" defaultValue={category}>
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="minRating">Valoración mínima</label>
            <select id="minRating" name="minRating" defaultValue={String(minRating)}>
              <option value="0">Todas</option>
              <option value="1">1★ o más</option>
              <option value="2">2★ o más</option>
              <option value="3">3★ o más</option>
              <option value="4">4★ o más</option>
              <option value="5">5★</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="order">Orden</label>
            <select id="order" name="order" defaultValue={order}>
              <option value="recent">Más recientes</option>
              <option value="title_asc">Título A-Z</option>
            </select>
          </div>

          <button type="submit" style={{ height: "fit-content" }}>
            Filtrar
          </button>
        </form>
      </section>

      <section className="top-space-lg">
        {filteredBooks.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
              No encontramos libros
            </h2>
            <p className="empty-state" style={{ marginBottom: 0 }}>
              Probá cambiar los filtros o hacer una búsqueda más amplia.
            </p>
          </div>
        ) : (
          <div className="grid-auto">
            {filteredBooks.map((book) => {
              const stats = ratingsStatsMap.get(book.id);

              return (
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
                          height: "240px",
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
                          height: "240px",
                          background: "var(--surface-soft)",
                          borderRadius: "14px",
                          marginBottom: "0.9rem",
                          border: "1px solid var(--border)",
                        }}
                      />
                    )}

                    <h2
                      style={{
                        fontSize: "1.15rem",
                        marginTop: 0,
                        marginBottom: "0.35rem",
                      }}
                    >
                      {book.title}
                    </h2>

                    <p className="subtle-text" style={{ marginTop: 0 }}>
                      {book.author}
                    </p>

                    <p style={{ marginTop: "0.45rem", fontSize: "0.95rem" }}>
                      <strong>Categoría:</strong> {getCategoryName(book)}
                    </p>

                    <p
                      style={{
                        marginTop: "0.45rem",
                        fontSize: "0.95rem",
                        color: "var(--accent)",
                        fontWeight: 600,
                      }}
                    >
                      {stats
                        ? `⭐ ${stats.average.toFixed(1)} · ${stats.count} reseña${stats.count === 1 ? "" : "s"}`
                        : "Sin reseñas"}
                    </p>

                    <p className="subtle-text" style={{ marginTop: "0.75rem" }}>
                      {book.description?.slice(0, 120) || "Sin descripción."}
                    </p>

                    <div
                      className="actions-row"
                      style={{ marginTop: "0.9rem", gap: "0.5rem" }}
                    >
                      {book.pdf_url && <span className="badge">PDF</span>}
                      {book.external_link && <span className="badge">Link</span>}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}