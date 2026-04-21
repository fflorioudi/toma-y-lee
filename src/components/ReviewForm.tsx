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

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("5");
  const [message, setMessage] = useState("");
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
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      book_id: bookId,
      user_id: user.id,
      review_text: reviewText,
      rating: Number(rating),
    });

    if (error) {
      if (error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique")) {
        setMessage("Ya dejaste una reseña para este libro.");
      } else {
        setMessage(error.message);
      }
      setLoading(false);
      return;
    }

    setMessage("Reseña publicada correctamente ✅");
    setReviewText("");
    setRating("5");
    setLoading(false);
    router.refresh();
  };

  return (
    <section style={{ marginTop: "3rem" }}>
      <h2>Dejar una reseña</h2>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="rating">Puntaje</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{
              display: "block",
              marginTop: "0.4rem",
              padding: "0.6rem",
              width: "100%",
            }}
          >
            <option value="1">1 / 5</option>
            <option value="2">2 / 5</option>
            <option value="3">3 / 5</option>
            <option value="4">4 / 5</option>
            <option value="5">5 / 5</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reviewText">Tu reseña</label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={5}
            style={{
              display: "block",
              marginTop: "0.4rem",
              padding: "0.7rem",
              width: "100%",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.8rem 1rem",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          {loading ? "Publicando..." : "Publicar reseña"}
        </button>
      </form>
    </section>
  );
}