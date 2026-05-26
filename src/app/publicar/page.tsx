"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import TurnstileWidget from "@/components/TurnstileWidget";

type Category = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
};

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function PublicarPage() {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [audioLink, setAudioLink] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: categoriesData }, { data: tagsData }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true }),

        supabase
          .from("tags")
          .select("id, name")
          .order("name", { ascending: true }),
      ]);

      setCategories((categoriesData || []) as Category[]);
      setTags((tagsData || []) as Tag[]);
    };

    loadData();
  }, [supabase]);

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

    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const cleanDescription = description.trim();
    const cleanLink = link.trim();
    const cleanAudioLink = audioLink.trim();

    if (cleanTitle.length < 2) {
      setMessage("El título es demasiado corto.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (cleanAuthor.length < 2) {
      setMessage("El nombre del autor es demasiado corto.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (cleanDescription && cleanDescription.length < 10) {
      setMessage("La descripción es demasiado corta.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (cleanLink && !isValidHttpUrl(cleanLink)) {
      setMessage("Ingresá un link externo válido.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (cleanAudioLink && !isValidHttpUrl(cleanAudioLink)) {
      setMessage("Ingresá un link de audiolibro válido.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (!cleanLink && !pdfFile && !cleanAudioLink) {
      setMessage("Tenés que agregar un link, subir un PDF o agregar un audiolibro.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      setMessage("Completá la verificación anti-bot.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const captchaResponse = await fetch("/api/turnstile/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: captchaToken }),
    });

    const captchaResult = await captchaResponse.json();

    if (!captchaResponse.ok || !captchaResult.success) {
      setMessage(captchaResult.message || "No se pudo validar la verificación anti-bot.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que estar logueado.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    let pdfUrl: string | null = null;
    let coverUrl: string | null = null;

    if (pdfFile) {
      const extension = pdfFile.name.split(".").pop()?.toLowerCase();

      if (extension !== "pdf") {
        setMessage("Solo se permiten archivos PDF.");
        setIsSuccess(false);
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
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("book-pdfs")
        .getPublicUrl(filePath);

      pdfUrl = publicUrlData.publicUrl;
    }

    if (coverFile) {
      const validTypes = ["image/jpeg", "image/png"];

      if (!validTypes.includes(coverFile.type)) {
        setMessage("La portada debe ser JPG, JPEG o PNG.");
        setIsSuccess(false);
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
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("book-covers")
        .getPublicUrl(filePath);

      coverUrl = publicUrlData.publicUrl;
    }

    const { data: insertedBook, error } = await supabase
      .from("books")
      .insert({
        user_id: user.id,
        title: cleanTitle,
        author: cleanAuthor,
        description: cleanDescription || null,
        external_link: cleanLink || null,
        audio_url: cleanAudioLink || null,
        pdf_url: pdfUrl,
        cover_url: coverUrl,
        category_id: categoryId || null,
      })
      .select("id")
      .single();

    if (error || !insertedBook) {
      setMessage(error?.message || "No se pudo publicar el libro.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (selectedTagIds.length > 0) {
      const tagRows = selectedTagIds.map((tagId) => ({
        book_id: insertedBook.id,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase.from("book_tags").insert(tagRows);

      if (tagsError) {
        setMessage(
          "El libro se publicó, pero no se pudieron guardar los tags. Revisá las políticas de book_tags."
        );
        setIsSuccess(false);
        setLoading(false);
        return;
      }
    }

    setMessage("Libro publicado correctamente");
    setIsSuccess(true);
    setTitle("");
    setAuthor("");
    setDescription("");
    setLink("");
    setAudioLink("");
    setCategoryId("");
    setSelectedTagIds([]);
    setTagSearch("");
    setShowTagPicker(false);
    setPdfFile(null);
    setCoverFile(null);
    setCaptchaToken("");
    setLoading(false);

    setTimeout(() => {
      router.push("/catalogo");
      router.refresh();
    }, 1000);
  };

  return (
    <main className="page-container">
      <section>
        <h1 className="section-title" style={{ color: "var(--accent)" }}>
          Compartir un libro
        </h1>
        <p className="subtle-text" style={{ marginTop: 0, maxWidth: "760px" }}>
          Sumá una lectura a la biblioteca colaborativa para que otros también
          puedan encontrarla y aprovecharla.
        </p>
      </section>

      <section className="card top-space" style={{ maxWidth: "760px", marginInline: "auto" }}>
        {message && (
          <p className={isSuccess ? "message-success" : "message-error"}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              placeholder="Título del libro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="author">Autor</label>
            <input
              id="author"
              placeholder="Autor"
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
              Elegí uno o varios temas relacionados con el libro.
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
              placeholder="Contá brevemente de qué trata el libro"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="form-field">
            <label htmlFor="link">Link externo</label>
            <input
              id="link"
              placeholder="Link del libro, web o recurso externo"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="audioLink">Audiolibro</label>
            <input
              id="audioLink"
              placeholder="Link de YouTube, Spotify, Drive u otro audio"
              value={audioLink}
              onChange={(e) => setAudioLink(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="form-field">
            <label>Portada (JPG, JPEG, PNG)</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="form-field">
            <label>Verificación</label>
            <TurnstileWidget
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken("")}
              onError={() => setCaptchaToken("")}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </section>
    </main>
  );
}