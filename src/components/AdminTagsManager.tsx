"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Tag = {
  id: string;
  name: string;
};

type Props = {
  tags: Tag[];
};

export default function AdminTagsManager({ tags }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [newTagName, setNewTagName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = newTagName.trim();

    if (!cleanName) {
      setMessage("El nombre del tag no puede estar vacío.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("tags").insert({
      name: cleanName,
    });

    if (error) {
      setMessage(
        error.code === "23505"
          ? "Ya existe un tag con ese nombre."
          : error.message
      );
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setNewTagName("");
    setMessage("Tag creado correctamente.");
    setIsSuccess(true);
    setLoading(false);
    router.refresh();
  };

  const startEditing = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdateTag = async (tagId: string) => {
    const cleanName = editingName.trim();

    if (!cleanName) {
      setMessage("El nombre del tag no puede estar vacío.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("tags")
      .update({ name: cleanName })
      .eq("id", tagId);

    if (error) {
      setMessage(
        error.code === "23505"
          ? "Ya existe un tag con ese nombre."
          : error.message
      );
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setEditingId(null);
    setEditingName("");
    setMessage("Tag actualizado correctamente.");
    setIsSuccess(true);
    setLoading(false);
    router.refresh();
  };

  const handleDeleteTag = async (tagId: string) => {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar este tag? También se va a quitar de los libros que lo tengan."
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("tags").delete().eq("id", tagId);

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setMessage("Tag eliminado correctamente.");
    setIsSuccess(true);
    setLoading(false);
    router.refresh();
  };

  return (
    <section className="card top-space">
      <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
        Administrar tags
      </h2>

      <p className="subtle-text" style={{ marginTop: 0 }}>
        Los tags ayudan a ordenar mejor los libros sin cambiar su categoría
        principal. Usá una lista cuidada y evitá duplicados.
      </p>

      {message && (
        <p className={isSuccess ? "message-success" : "message-error"}>
          {message}
        </p>
      )}

      <form onSubmit={handleCreateTag} className="form-grid">
        <div className="form-field">
          <label htmlFor="tagName">Nuevo tag</label>
          <input
            id="tagName"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Ej: Oración, Santos, Vida interior"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear tag"}
        </button>
      </form>

      <div className="top-space">
        {tags.length === 0 ? (
          <p className="empty-state" style={{ margin: 0 }}>
            Todavía no hay tags cargados.
          </p>
        ) : (
          <div className="list-stack">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="card"
                style={{
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {editingId === tag.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{ flex: "1 1 220px" }}
                    />

                    <div className="actions-row" style={{ gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateTag(tag.id)}
                        disabled={loading}
                      >
                        Guardar
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="secondary-link"
                        style={{ border: "1px solid var(--border)" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="badge">{tag.name}</span>

                    <div className="actions-row" style={{ gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => startEditing(tag)}
                        className="secondary-link"
                        style={{ border: "1px solid var(--border)" }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={loading}
                        style={{
                          background: "transparent",
                          color: "var(--accent)",
                          border: "1px solid var(--accent)",
                        }}
                      >
                        Borrar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}