"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  external_link: string | null;
  pdf_url: string | null;
  cover_url: string | null;
  category_id?: string | null;
};

type Props = {
  book: Book;
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

export default function EditBookForm({ book }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description || "");
  const [externalLink, setExternalLink] = useState(book.external_link || "");
  const [categoryId, setCategoryId] = useState(book.category_id || "");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [removePdf, setRemovePdf] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const hasExistingPdf = !!book.pdf_url;
  const hasExistingCover = !!book.cover_url;

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      setCategories((data || []) as Category[]);
    };

    loadCategories();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que estar logueado.");
      setLoading(false);
      return;
    }

    const finalPdfWillExist = !!pdfFile || (!!book.pdf_url && !removePdf);
    const finalLinkWillExist = !!externalLink.trim();

    if (!finalLinkWillExist && !finalPdfWillExist) {
      setMessage("El libro debe tener un link o un PDF.");
      setLoading(false);
      return;
    }

    let newPdfUrl = removePdf ? null : book.pdf_url || null;
    let newCoverUrl = removeCover ? null : book.cover_url || null;

    let oldPdfPathToDelete: string | null = null;
    let oldCoverPathToDelete: string | null = null;

    if (removePdf && book.pdf_url) {
      oldPdfPathToDelete = getStoragePathFromPublicUrl(book.pdf_url, "book-pdfs");
    }

    if (removeCover && book.cover_url) {
      oldCoverPathToDelete = getStoragePathFromPublicUrl(book.cover_url, "book-covers");
    }

    if (pdfFile) {
      const extension = pdfFile.name.split(".").pop()?.toLowerCase();

      if (extension !== "pdf") {
        setMessage("Solo se permiten archivos PDF.");
        setLoading(false);
        return;
      }

      const fileName = `${user.id}-${Date.now()}.pdf`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("book-pdfs")
        .upload(filePath, pdfFile, {
          upsert: false,
          contentType: "application/pdf",
        });

      if (uploadError) {
        setMessage(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("book-pdfs")
        .getPublicUrl(filePath);

      if (book.pdf_url) {
        oldPdfPathToDelete = getStoragePathFromPublicUrl(book.pdf_url, "book-pdfs");
      }

      newPdfUrl = publicUrlData.publicUrl;
    }

    if (coverFile) {
      const validTypes = ["image/jpeg", "image/png"];

      if (!validTypes.includes(coverFile.type)) {
        setMessage("La portada debe ser JPG, JPEG o PNG.");
        setLoading(false);
        return;
      }

      const extension = coverFile.type === "image/png" ? "png" : "jpg";
      const fileName = `${user.id}-${Date.now()}.${extension}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(filePath, coverFile, {
          upsert: false,
          contentType: coverFile.type,
        });

      if (uploadError) {
        setMessage(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("book-covers")
        .getPublicUrl(filePath);

      if (book.cover_url) {
        oldCoverPathToDelete = getStoragePathFromPublicUrl(book.cover_url, "book-covers");
      }

      newCoverUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("books")
      .update({
        title,
        author,
        description,
        external_link: externalLink.trim() || null,
        cover_url: newCoverUrl,
        pdf_url: newPdfUrl,
        category_id: categoryId || null,
      })
      .eq("id", book.id);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (oldPdfPathToDelete) {
      await supabase.storage.from("book-pdfs").remove([oldPdfPathToDelete]);
    }

    if (oldCoverPathToDelete) {
      await supabase.storage.from("book-covers").remove([oldCoverPathToDelete]);
    }

    setMessage("Libro actualizado correctamente ✅");
    setLoading(false);

    setTimeout(() => {
      router.push("/perfil");
      router.refresh();
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
      {message && <p style={{ marginBottom: "1rem" }}>{message}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="title">Título</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.4rem",
            padding: "0.7rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="author">Autor</label>
        <input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.4rem",
            padding: "0.7rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="category">Categoría</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.4rem",
            padding: "0.7rem",
          }}
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.4rem",
            padding: "0.7rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="externalLink">Link externo</label>
        <input
          id="externalLink"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.4rem",
            padding: "0.7rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>PDF actual:</strong>{" "}
        {hasExistingPdf ? (
          <a
            href={book.pdf_url!}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: "0.4rem" }}
          >
            Ver PDF
          </a>
        ) : (
          "No tiene PDF."
        )}
      </div>

      {hasExistingPdf && (
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={removePdf}
              onChange={(e) => setRemovePdf(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            Eliminar PDF actual
          </label>
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label>Reemplazar PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          style={{ display: "block", marginTop: "0.4rem" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Portada actual:</strong>
        <div style={{ marginTop: "0.5rem" }}>
          {hasExistingCover ? (
            <img
              src={book.cover_url!}
              alt="Portada actual"
              style={{
                width: "140px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          ) : (
            <p>No tiene portada.</p>
          )}
        </div>
      </div>

      {hasExistingCover && (
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={removeCover}
              onChange={(e) => setRemoveCover(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            Eliminar portada actual
          </label>
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label>Nueva portada (JPG, JPEG, PNG)</label>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          style={{ display: "block", marginTop: "0.4rem" }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "0.8rem 1rem",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}