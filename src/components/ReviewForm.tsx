"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  bookId: string;
};

export default function ReviewForm({ bookId }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que iniciar sesión para dejar una reseña.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      book_id: bookId,
      user_id: user.id,
      review_text: reviewText.trim() || null,
      rating: Number(rating),
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setMessage("Reseña publicada correctamente");
    setIsSuccess(true);
    setReviewText("");
    setRating("5");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1rem" }}>
      {message && (
        <p className={isSuccess ? "message-success" : "message-error"}>
          {message}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="rating">Puntaje</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="5">5 / 5</option>
          <option value="4">4 / 5</option>
          <option value="3">3 / 5</option>
          <option value="2">2 / 5</option>
          <option value="1">1 / 5</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="reviewText">Tu reseña</label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Publicando..." : "Publicar reseña"}
      </button>
    </form>
  );
}