"use client";

import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleToggleHidden = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("books")
      .update({ is_hidden: !isHidden })
      .eq("id", bookId);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(isHidden ? "Libro visible nuevamente." : "Libro ocultado.");
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar este libro? También se intentará borrar su PDF y su portada."
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, pdf_url, cover_url")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      setMessage(bookError?.message || "No se pudo obtener el libro.");
      setLoading(false);
      return;
    }

    if (book.pdf_url) {
      const pdfPath = getStoragePathFromPublicUrl(book.pdf_url, "book-pdfs");
      if (pdfPath) {
        await supabase.storage.from("book-pdfs").remove([pdfPath]);
      }
    }

    if (book.cover_url) {
      const coverPath = getStoragePathFromPublicUrl(book.cover_url, "book-covers");
      if (coverPath) {
        await supabase.storage.from("book-covers").remove([coverPath]);
      }
    }

    const { error: deleteError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (deleteError) {
      setMessage(deleteError.message);
      setLoading(false);
      return;
    }

    if (pathname.startsWith("/admin/libros/")) {
      router.push("/admin");
    } else {
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="actions-row">
        <Link href={`/admin/libros/${bookId}/editar`} className="secondary-link">
          Editar
        </Link>

        <button type="button" onClick={handleToggleHidden} disabled={loading}>
          {loading ? "Procesando..." : isHidden ? "Mostrar" : "Ocultar"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          style={{
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
        >
          Borrar
        </button>
      </div>

      {message && (
        <p className="subtle-text" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}