"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

export default function PublicarPage() {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!link && !pdfFile) {
      setMessage("Tenés que agregar un link o subir un PDF.");
      setLoading(false);
      return;
    }

    let pdfUrl: string | null = null;
    let coverUrl: string | null = null;

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
        .upload(filePath, pdfFile, { upsert: false });

      if (uploadError) {
        setMessage(uploadError.message);
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

      coverUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("books").insert({
      user_id: user.id,
      title,
      author,
      description,
      external_link: link || null,
      pdf_url: pdfUrl,
      cover_url: coverUrl,
      category_id: categoryId || null,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Libro publicado correctamente ✅");
    setTitle("");
    setAuthor("");
    setDescription("");
    setLink("");
    setCategoryId("");
    setPdfFile(null);
    setCoverFile(null);
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
          Sumá una lectura a la biblioteca colaborativa de la JAR para que otros
          también puedan encontrarla y aprovecharla.
        </p>
      </section>

      <section className="card top-space" style={{ maxWidth: "760px" }}>
        {message && (
          <p
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: message.includes("✅") ? "var(--accent)" : "var(--text)",
            }}
          >
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
              placeholder="Link del libro (opcional si subís PDF)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
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

          <button type="submit" disabled={loading}>
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </section>
    </main>
  );
}