"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  reviewId: string;
};

export default function ReportReviewButton({ reviewId }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    const reason = window.prompt(
      "Motivo del reporte: spam / ofensiva / fuera de tema / inapropiada"
    );

    if (!reason) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Tenés que iniciar sesión para reportar.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("review_reports").insert({
      review_id: reviewId,
      user_id: user.id,
      reason,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Reseña reportada.");
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleReport}
      disabled={loading}
      style={{
        marginTop: "0.8rem",
        padding: "0.4rem 0.8rem",
        borderRadius: "8px",
        border: "1px solid #ccc",
        cursor: "pointer",
      }}
    >
      Reportar reseña
    </button>
  );
}