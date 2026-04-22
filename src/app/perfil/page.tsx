import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "@/components/EditProfileForm";

type Book = {
  id: string;
  title: string;
  author: string;
  created_at: string;
  cover_url: string | null;
};

type FavoriteBook = {
  id: string;
  books:
    | {
        id: string;
        title: string;
        author: string;
        cover_url: string | null;
      }
    | {
        id: string;
        title: string;
        author: string;
        cover_url: string | null;
      }[]
    | null;
};

type Profile = {
  name: string | null;
  last_name: string | null;
  role: string | null;
};

function getFavoriteBookData(favorite: FavoriteBook) {
  if (Array.isArray(favorite.books)) {
    return favorite.books[0] || null;
  }
  return favorite.books || null;
}

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users_profile")
    .select("name, last_name, role")
    .eq("id", user.id)
    .single();

  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, author, created_at, cover_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { count: reviewsCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: favoritesData } = await supabase
    .from("favorites")
    .select(`
      id,
      books (
        id,
        title,
        author,
        cover_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="page-container">
        <h1 className="section-title">Mi perfil</h1>
        <p className="empty-state">Error al cargar tus libros.</p>
      </main>
    );
  }

  const typedBooks = (books || []) as Book[];
  const typedFavorites = (favoritesData || []) as FavoriteBook[];
  const typedProfile = (profile || {
    name: "",
    last_name: "",
    role: "user",
  }) as Profile;

  return (
    <main className="page-container">
      <section>
        <h1 className="section-title" style={{ color: "var(--accent)" }}>
          Mi perfil
        </h1>
        <p className="subtle-text" style={{ marginTop: 0, wordBreak: "break-word" }}>
          {user.email}
        </p>
      </section>

      <section className="card top-space">
        <h2 style={{ marginTop: 0 }}>Resumen</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <div className="card" style={{ boxShadow: "none" }}>
            <p className="subtle-text" style={{ marginTop: 0 }}>
              Libros compartidos
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {typedBooks.length}
            </p>
          </div>

          <div className="card" style={{ boxShadow: "none" }}>
            <p className="subtle-text" style={{ marginTop: 0 }}>
              Reseñas realizadas
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {reviewsCount || 0}
            </p>
          </div>

          <div className="card" style={{ boxShadow: "none" }}>
            <p className="subtle-text" style={{ marginTop: 0 }}>
              Favoritos guardados
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {typedFavorites.length}
            </p>
          </div>
        </div>
      </section>

      <section className="card top-space">
        <h2 style={{ marginTop: 0 }}>Mis datos</h2>
        <EditProfileForm
          initialName={typedProfile.name || ""}
          initialLastName={typedProfile.last_name || ""}
        />
      </section>

      <section className="top-space-lg">
        <h2 className="section-title" style={{ fontSize: "2rem", color: "var(--accent)" }}>
          Mis favoritos
        </h2>

        {typedFavorites.length === 0 ? (
          <p className="empty-state">Todavía no guardaste libros en favoritos.</p>
        ) : (
          <div className="grid-auto">
            {typedFavorites.map((favorite) => {
              const book = getFavoriteBookData(favorite);
              if (!book) return null;

              return (
                <article key={favorite.id} className="card card-hover">
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

                  <h3 style={{ marginTop: 0, marginBottom: "0.35rem" }}>{book.title}</h3>
                  <p className="subtle-text" style={{ marginTop: 0 }}>
                    {book.author}
                  </p>

                  <div className="actions-row" style={{ marginTop: "1rem" }}>
                    <Link href={`/libro/${book.id}`} className="primary-link">
                      Ver libro
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="top-space-lg">
        <h2 className="section-title" style={{ fontSize: "2rem", color: "var(--accent)" }}>
          Mis libros
        </h2>

        {typedBooks.length === 0 ? (
          <p className="empty-state">Todavía no subiste libros.</p>
        ) : (
          <div className="grid-auto">
            {typedBooks.map((book) => (
              <article key={book.id} className="card card-hover">
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

                <h3 style={{ marginTop: 0, marginBottom: "0.35rem" }}>{book.title}</h3>
                <p className="subtle-text" style={{ marginTop: 0 }}>
                  {book.author}
                </p>

                <div className="actions-row" style={{ marginTop: "1rem" }}>
                  <Link href={`/libro/${book.id}`} className="primary-link">
                    Ver libro
                  </Link>

                  <Link href={`/perfil/libros/${book.id}/editar`} className="secondary-link">
                    Editar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}