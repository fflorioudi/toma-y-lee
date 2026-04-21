import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Profile = {
  role: string | null;
};

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("users_profile")
      .select("role")
      .eq("id", user.id)
      .single();

    const typedProfile = profile as Profile | null;
    isAdmin = typedProfile?.role === "admin";
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(243, 243, 241, 0.96)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "var(--text)",
                fontWeight: 700,
                fontSize: "1.2rem",
                letterSpacing: "-0.02em",
              }}
            >
              Toma y lee
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/catalogo" style={{ textDecoration: "none" }}>
              Catálogo
            </Link>

            {user ? (
              <>
                <Link href="/publicar" style={{ textDecoration: "none" }}>
                  Publicar
                </Link>

                <Link href="/perfil" style={{ textDecoration: "none" }}>
                  Perfil
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    style={{
                      textDecoration: "none",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" style={{ textDecoration: "none" }}>
                Login
              </Link>
            )}
          </div>

          {user && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.8rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "var(--text-soft)",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  wordBreak: "break-word",
                }}
              >
                {user.email}
              </span>

              <form action="/logout" method="post">
                <button
                  type="submit"
                  style={{
                    padding: "0.65rem 0.95rem",
                    background: "var(--dark-button)",
                    color: "var(--white)",
                  }}
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}