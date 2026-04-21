"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  bookId: string;
};

export default function ReportBookButton({ bookId }: Props) {
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

    const { error } = await supabase.from("book_reports").insert({
      book_id: bookId,
      user_id: user.id,
      reason,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Libro reportado.");
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleReport}
      disabled={loading}
      style={{
        padding: "0.8rem 1rem",
        borderRadius: "10px",
        border: "1px solid #ccc",
        cursor: "pointer",
      }}
    >
      Reportar libro
    </button>
  );
}