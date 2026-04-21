"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  bookId: string;
};

export default function ReportBookButton({ bookId }: Props) {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    const reason = window.prompt("Motivo del reporte:");
    if (!reason) return;

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que iniciar sesión para reportar.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("book_reports").insert({
      book_id: bookId,
      user_id: user.id,
      reason,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Reporte enviado.");
    setLoading(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleReport}
        disabled={loading}
        style={{
          background: "transparent",
          color: "var(--text)",
          border: "1px solid var(--border)",
        }}
      >
        {loading ? "Enviando..." : "Reportar libro"}
      </button>

      {message && (
        <p className="subtle-text" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}