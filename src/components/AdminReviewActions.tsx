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

  const handleToggleHidden = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("reviews")
      .update({ is_hidden: !isHidden })
      .eq("id", reviewId);

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
      "¿Seguro que querés borrar esta reseña?"
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
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