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

type Profile = {
  name: string | null;
  last_name: string | null;
  role: string | null;
};

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

  if (error) {
    return (
      <main className="page-container">
        <h1 className="section-title">Mi perfil</h1>
        <p className="empty-state">Error al cargar tus libros.</p>
      </main>
    );
  }

  const typedBooks = (books || []) as Book[];
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
        <p className="subtle-text" style={{ marginTop: 0 }}>
          {user.email}
        </p>
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