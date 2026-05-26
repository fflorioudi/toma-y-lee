"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
};

type BookTagRow = {
  tag_id: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  external_link: string | null;
  audio_url: string | null;
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

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function EditBookForm({ book }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description || "");
  const [externalLink, setExternalLink] = useState(book.external_link || "");
  const [audioLink, setAudioLink] = useState(book.audio_url || "");
  const [categoryId, setCategoryId] = useState(book.category_id || "");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [removePdf, setRemovePdf] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasExistingPdf = !!book.pdf_url;
  const hasExistingCover = !!book.cover_url;

  useEffect(() => {
    const loadData = async () => {
      const [
        { data: categoriesData },
        { data: tagsData },
        { data: bookTagsData },
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true }),

        supabase
          .from("tags")
          .select("id, name")
          .order("name", { ascending: true }),

        supabase
          .from("book_tags")
          .select("tag_id")
          .eq("book_id", book.id),
      ]);

      setCategories((categoriesData || []) as Category[]);
      setTags((tagsData || []) as Tag[]);

      const currentBookTags = (bookTagsData || []) as BookTagRow[];
      setSelectedTagIds(currentBookTags.map((row) => row.tag_id));
    };

    loadData();
  }, [supabase, book.id]);

  const selectedTags = useMemo(() => {
    return tags.filter((tag) => selectedTagIds.includes(tag.id));
  }, [tags, selectedTagIds]);

  const filteredTags = useMemo(() => {
    const search = tagSearch.trim().toLowerCase();

    if (!search) return tags;

    return tags.filter((tag) => tag.name.toLowerCase().includes(search));
  }, [tags, tagSearch]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId]
    );
  };

  const clearSelectedTags = () => {
    setSelectedTagIds([]);
    setTagSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const cleanDescription = description.trim();
    const cleanExternalLink = externalLink.trim();
    const cleanAudioLink = audioLink.trim();

    if (cleanTitle.length < 2) {
      setMessage("El título es demasiado corto.");
      setLoading(false);
      return;
    }

    if (cleanAuthor.length < 2) {
      setMessage("El nombre del autor es demasiado corto.");
      setLoading(false);
      return;
    }

    if (cleanDescription && cleanDescription.length < 10) {
      setMessage("La descripción es demasiado corta.");
      setLoading(false);
      return;
    }

    if (cleanExternalLink && !isValidHttpUrl(cleanExternalLink)) {
      setMessage("Ingresá un link externo válido.");
      setLoading(false);
      return;
    }

    if (cleanAudioLink && !isValidHttpUrl(cleanAudioLink)) {
      setMessage("Ingresá un link de audiolibro válido.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que estar logueado.");
      setLoading(false);
      return;
    }

    const finalPdfWillExist = !!pdfFile || (!!book.pdf_url && !removePdf);
    const finalLinkWillExist = !!cleanExternalLink;
    const finalAudioWillExist = !!cleanAudioLink;

    if (!finalLinkWillExist && !finalPdfWillExist && !finalAudioWillExist) {
      setMessage("El libro debe tener un link, un PDF o un audiolibro.");
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
      oldCoverPathToDelete = getStoragePathFromPublicUrl(
        book.cover_url,
        "book-covers"
      );
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
        oldPdfPathToDelete = getStoragePathFromPublicUrl(
          book.pdf_url,
          "book-pdfs"
        );
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
        oldCoverPathToDelete = getStoragePathFromPublicUrl(
          book.cover_url,
          "book-covers"
        );
      }

      newCoverUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("books")
      .update({
        title: cleanTitle,
        author: cleanAuthor,
        description: cleanDescription || null,
        external_link: cleanExternalLink || null,
        audio_url: cleanAudioLink || null,
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

    const { error: deleteTagsError } = await supabase
      .from("book_tags")
      .delete()
      .eq("book_id", book.id);

    if (deleteTagsError) {
      setMessage(deleteTagsError.message);
      setLoading(false);
      return;
    }

    if (selectedTagIds.length > 0) {
      const tagRows = selectedTagIds.map((tagId) => ({
        book_id: book.id,
        tag_id: tagId,
      }));

      const { error: insertTagsError } = await supabase
        .from("book_tags")
        .insert(tagRows);

      if (insertTagsError) {
        setMessage(insertTagsError.message);
        setLoading(false);
        return;
      }
    }

    if (oldPdfPathToDelete) {
      await supabase.storage.from("book-pdfs").remove([oldPdfPathToDelete]);
    }

    if (oldCoverPathToDelete) {
      await supabase.storage.from("book-covers").remove([oldCoverPathToDelete]);
    }

    setMessage("Libro actualizado correctamente ✅");
    setIsSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/perfil");
      router.refresh();
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1.5rem" }}>
      {message && (
        <p className={isSuccess ? "message-success" : "message-error"}>
          {message}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="author">Autor</label>
        <input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="category">Categoría</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Tags</label>

        <p className="subtle-text" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          Tocá los tags para agregarlos o sacarlos del libro.
        </p>

        {selectedTags.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            {selectedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                style={{
                  padding: "0.45rem 0.75rem",
                  borderRadius: "999px",
                  border: "1px solid var(--accent)",
                  background: "var(--accent)",
                  color: "var(--white)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tag.name} ×
              </button>
            ))}
          </div>
        ) : (
          <p className="subtle-text" style={{ marginTop: 0 }}>
            No seleccionaste tags todavía.
          </p>
        )}

        <div className="actions-row" style={{ gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setShowTagPicker((current) => !current)}
            className="secondary-link"
            style={{ border: "1px solid var(--border)" }}
          >
            {showTagPicker ? "Ocultar tags" : "Elegir tags"}
          </button>

          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={clearSelectedTags}
              style={{
                background: "transparent",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {showTagPicker && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              background: "var(--surface-soft)",
            }}
          >
            <input
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Buscar tag..."
              style={{ marginBottom: "0.9rem" }}
            />

            {filteredTags.length === 0 ? (
              <p className="empty-state" style={{ margin: 0 }}>
                No encontramos tags con esa búsqueda.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.55rem",
                  maxHeight: "230px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }}
              >
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        padding: "0.5rem 0.8rem",
                        borderRadius: "999px",
                        border: isSelected
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                        background: isSelected
                          ? "var(--accent)"
                          : "var(--surface)",
                        color: isSelected ? "var(--white)" : "var(--text)",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </div>

      <div className="form-field">
        <label htmlFor="externalLink">Link externo</label>
        <input
          id="externalLink"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="audioLink">Audiolibro</label>
        <input
          id="audioLink"
          value={audioLink}
          onChange={(e) => setAudioLink(e.target.value)}
          placeholder="Link de YouTube, Spotify, Drive u otro audio"
        />
      </div>

      <div className="form-field">
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
        <div className="form-field">
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

      <div className="form-field">
        <label>Reemplazar PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="form-field">
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
                border: "1px solid var(--border)",
              }}
            />
          ) : (
            <p className="subtle-text">No tiene portada.</p>
          )}
        </div>
      </div>

      {hasExistingCover && (
        <div className="form-field">
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

      <div className="form-field">
        <label>Nueva portada (JPG, JPEG, PNG)</label>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}