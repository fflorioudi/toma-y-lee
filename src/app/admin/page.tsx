import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Book = {
  id: string;
  user_id: string | null;
  title: string;
  author: string;
  is_hidden: boolean;
};

type ProfileRow = {
  id: string;
  role?: string | null;
  name: string | null;
  last_name: string | null;
};

function getFullName(profile?: ProfileRow) {
  if (!profile) return "Usuario";
  const fullName = `${profile.name || ""} ${profile.last_name || ""}`.trim();
  return fullName || "Usuario";
}

export default async function AdminPage() {
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

  const { data: books } = await supabase
    .from("books")
    .select("id, user_id, title, author, is_hidden")
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase.from("reviews").select("book_id");

  const reviewsCount = new Map<string, number>();

  reviews?.forEach((r) => {
    if (!r.book_id) return;
    reviewsCount.set(r.book_id, (reviewsCount.get(r.book_id) || 0) + 1);
  });

  const typedBooks = (books || []) as Book[];

  const uploaderIds = [
    ...new Set(
      typedBooks.map((book) => book.user_id).filter((uid): uid is string => !!uid)
    ),
  ];

  let profilesMap = new Map<string, ProfileRow>();

  if (uploaderIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("users_profile")
      .select("id, name, last_name")
      .in("id", uploaderIds);

    const typedProfiles = (profilesData || []) as ProfileRow[];
    profilesMap = new Map(typedProfiles.map((profile) => [profile.id, profile]));
  }

  return (
    <main className="page-container">
      <section>
        <h1 className="section-title" style={{ color: "var(--accent)" }}>
          Panel admin
        </h1>
        <p className="subtle-text" style={{ marginTop: 0 }}>
          Gestioná libros, categorías y accesos del contenido compartido.
        </p>

        <div className="actions-row top-space">
          <Link href="/admin/categorias" className="primary-link">
            Gestionar categorías
          </Link>
        </div>
      </section>

      <section className="top-space-lg">
        <h2 style={{ marginBottom: "1rem" }}>Libros</h2>

        {typedBooks.length === 0 ? (
          <p className="empty-state">No hay libros cargados.</p>
        ) : (
          <div className="admin-stack">
            {typedBooks.map((book) => (
              <article key={book.id} className="card">
                <h3 style={{ marginTop: 0, marginBottom: "0.4rem" }}>{book.title}</h3>
                <p className="subtle-text" style={{ marginTop: 0 }}>
                  {book.author}
                </p>

                <p style={{ marginTop: "0.7rem" }}>
                  <strong>Subido por:</strong>{" "}
                  {book.user_id ? getFullName(profilesMap.get(book.user_id)) : "Usuario"}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  <span style={{ color: book.is_hidden ? "var(--accent)" : "var(--text)" }}>
                    {book.is_hidden ? "Oculto" : "Visible"}
                  </span>
                </p>

                <p>
                  <strong>Reseñas:</strong> {reviewsCount.get(book.id) || 0}
                </p>

                <div className="actions-row" style={{ marginTop: "1rem" }}>
                  <Link href={`/admin/libros/${book.id}`} className="primary-link">
                    Gestionar
                  </Link>

                  <Link href={`/libro/${book.id}`} className="secondary-link">
                    Ver libro
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