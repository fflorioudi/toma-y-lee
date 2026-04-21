"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
};

export default function AdminCategoriesManager({ categories }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("categories").insert({
      name: newCategory.trim(),
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setNewCategory("");
    setLoading(false);
    router.refresh();
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("categories")
      .update({ name: editingName.trim() })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setEditingId(null);
    setEditingName("");
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar esta categoría?"
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <form
        onSubmit={handleCreate}
        style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem" }}
      >
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nueva categoría"
          style={{
            flex: 1,
            padding: "0.7rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.7rem 1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Crear
        </button>
      </form>

      <div style={{ display: "grid", gap: "1rem" }}>
        {categories.map((category) => (
          <article
            key={category.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            {editingId === category.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "0.8rem",
                  }}
                />

                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <button
                    type="button"
                    onClick={() => handleUpdate(category.id)}
                    disabled={loading}
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    Guardar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{category.name}</h3>

                <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.8rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    }}
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    disabled={loading}
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    Borrar
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}