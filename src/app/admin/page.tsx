import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    reported?: string;
  }>;
};

type Book = {
  id: string;
  user_id: string | null;
  title: string;
  author: string;
  is_hidden: boolean;
  report_count?: number | null;
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

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const q = params.q?.trim() || "";
  const status = params.status || "all";
  const reported = params.reported || "all";

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

  let query = supabase
    .from("books")
    .select("id, user_id, title, author, is_hidden, report_count")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  }

  if (status === "visible") {
    query = query.eq("is_hidden", false);
  }

  if (status === "hidden") {
    query = query.eq("is_hidden", true);
  }

  if (reported === "yes") {
    query = query.gt("report_count", 0);
  }

  if (reported === "no") {
    query = query.or("report_count.is.null,report_count.eq.0");
  }

  const { data: books } = await query;
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

      <section className="card top-space">
        <form
          method="GET"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr auto",
            gap: "1rem",
            alignItems: "end",
          }}
        >
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
            <label htmlFor="status">Estado</label>
            <select id="status" name="status" defaultValue={status}>
              <option value="all">Todos</option>
              <option value="visible">Visibles</option>
              <option value="hidden">Ocultos</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="reported">Reportes</label>
            <select id="reported" name="reported" defaultValue={reported}>
              <option value="all">Todos</option>
              <option value="yes">Reportados</option>
              <option value="no">No reportados</option>
            </select>
          </div>

          <button type="submit" style={{ height: "fit-content" }}>
            Filtrar
          </button>
        </form>
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

                <p>
                  <strong>Reportes:</strong> {book.report_count || 0}
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