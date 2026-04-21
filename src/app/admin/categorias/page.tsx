import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminCategoriesManager from "@/components/AdminCategoriesManager";

type Category = {
  id: string;
  name: string;
};

export default async function AdminCategoriasPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  const typedCategories = (categories || []) as Category[];

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

      <h1>Gestionar categorías</h1>

      <AdminCategoriesManager categories={typedCategories} />
    </main>
  );
}