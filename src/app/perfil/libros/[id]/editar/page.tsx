import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditBookForm from "@/components/EditBookForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  description: string | null;
  external_link: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  cover_url: string | null;
  category_id: string | null;
};

export default async function EditarLibroPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: book, error } = await supabase
    .from("books")
    .select(
      "id, user_id, title, author, description, external_link, audio_url, pdf_url, cover_url, category_id"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !book) {
    notFound();
  }

  const typedBook = book as Book;

  return (
    <main style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Editar libro</h1>
      <EditBookForm book={typedBook} />
    </main>
  );
}