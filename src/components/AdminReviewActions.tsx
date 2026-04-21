"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  reviewId: string;
  isHidden: boolean;
};

export default function AdminReviewActions({ reviewId, isHidden }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleToggleHidden = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("reviews")
      .update({ is_hidden: !isHidden })
      .eq("id", reviewId);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(isHidden ? "Reseña visible nuevamente." : "Reseña ocultada.");
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("¿Seguro que querés borrar esta reseña?");
    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Reseña eliminada.");
    router.refresh();
    setLoading(false);
  };

  return (
    <div>
      <div className="actions-row">
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