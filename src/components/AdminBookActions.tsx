"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Props = {
  bookId: string;
  isHidden: boolean;
};

function getStoragePathFromPublicUrl(url: string, bucket: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export default function AdminBookActions({ bookId, isHidden }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleHidden = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("books")
      .update({ is_hidden: !isHidden })
      .eq("id", bookId);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar este libro? También se intentará borrar su PDF y su portada."
    );

    if (!confirmed) return;

    setLoading(true);

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, pdf_url, cover_url")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      alert(bookError?.message || "No se pudo obtener el libro.");
      setLoading(false);
      return;
    }

    const storageErrors: string[] = [];

    if (book.pdf_url) {
      const pdfPath = getStoragePathFromPublicUrl(book.pdf_url, "book-pdfs");

      if (pdfPath) {
        const { error: pdfDeleteError } = await supabase.storage
          .from("book-pdfs")
          .remove([pdfPath]);

        if (
          pdfDeleteError &&
          !pdfDeleteError.message.toLowerCase().includes("not found")
        ) {
          storageErrors.push(`PDF: ${pdfDeleteError.message}`);
        }
      }
    }

    if (book.cover_url) {
      const coverPath = getStoragePathFromPublicUrl(book.cover_url, "book-covers");

      if (coverPath) {
        const { error: coverDeleteError } = await supabase.storage
          .from("book-covers")
          .remove([coverPath]);

        if (
          coverDeleteError &&
          !coverDeleteError.message.toLowerCase().includes("not found")
        ) {
          storageErrors.push(`Portada: ${coverDeleteError.message}`);
        }
      }
    }

    if (storageErrors.length > 0) {
      alert(
        `No se pudieron borrar algunos archivos del storage:\n${storageErrors.join("\n")}`
      );
      setLoading(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (deleteError) {
      alert(deleteError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "0.8rem",
        marginTop: "0.8rem",
        flexWrap: "wrap",
      }}
    >
      <Link href={`/admin/libros/${bookId}/editar`}>
        Editar
      </Link>

      <button
        type="button"
        onClick={handleToggleHidden}
        disabled={loading}
        style={{
          padding: "0.4rem 0.8rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        {isHidden ? "Mostrar" : "Ocultar"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        style={{
          padding: "0.4rem 0.8rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Borrar
      </button>
    </div>
  );
}