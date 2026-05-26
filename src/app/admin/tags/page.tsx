import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminTagsManager from "@/components/AdminTagsManager";

type Tag = {
  id: string;
  name: string;
};

export default async function AdminTagsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  const typedTags = (tags || []) as Tag[];

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <Link
        href="/admin"
        style={{
          display: "inline-block",
          marginBottom: "1rem",
          textDecoration: "none",
          color: "inherit",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "0.5rem 0.9rem",
        }}
      >
        ← Volver al panel admin
      </Link>

      <h1>Gestionar tags</h1>

      <AdminTagsManager tags={typedTags} />
    </main>
  );
}