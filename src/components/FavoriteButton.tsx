"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  bookId: string;
  initialIsFavorite: boolean;
};

export default function FavoriteButton({
  bookId,
  initialIsFavorite,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleToggleFavorite = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que iniciar sesión para guardar favoritos.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId);

      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      setIsFavorite(false);
      setMessage("Libro quitado de favoritos.");
      setIsSuccess(true);
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        book_id: bookId,
      });

      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      setIsFavorite(true);
      setMessage("Libro guardado en favoritos.");
      setIsSuccess(true);
    }

    router.refresh();
    setLoading(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleToggleFavorite}
        disabled={loading}
        style={{
          background: isFavorite ? "var(--accent)" : "transparent",
          color: isFavorite ? "var(--white)" : "var(--text)",
          border: isFavorite ? "1px solid var(--accent)" : "1px solid var(--border)",
        }}
      >
        {loading
          ? "Procesando..."
          : isFavorite
          ? "♥ Quitar de favoritos"
          : "♡ Guardar en favoritos"}
      </button>

      {message && (
        <p className={isSuccess ? "message-success" : "message-error"}>
          {message}
        </p>
      )}
    </div>
  );
}