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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleToggleHidden = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("reviews")
      .update({ is_hidden: !isHidden })
      .eq("id", reviewId);

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setMessage("Estado actualizado");
    setIsSuccess(true);
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
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setMessage("Reseña eliminada");
    setIsSuccess(true);
    router.refresh();
    setLoading(false);
  };

  return (
    <div>
      <div className="actions-row">
        <button onClick={handleToggleHidden} disabled={loading}>
          {loading ? "Procesando..." : isHidden ? "Mostrar" : "Ocultar"}
        </button>

        <button onClick={handleDelete} disabled={loading}>
          Borrar
        </button>
      </div>

      {message && (
        <p className={isSuccess ? "message-success" : "message-error"}>
          {message}
        </p>
      )}
    </div>
  );
}