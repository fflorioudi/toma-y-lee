"use client";

import { useEffect, useRef } from "react";

type Props = {
  bookId: string;
};

const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default function BookViewTracker({ bookId }: Props) {
  const alreadyRanRef = useRef(false);

  useEffect(() => {
    if (alreadyRanRef.current) return;
    alreadyRanRef.current = true;

    const registerView = async () => {
      try {
        const storageKey = `viewed_book_${bookId}`;
        const lastViewedAt = localStorage.getItem(storageKey);
        const now = Date.now();

        if (lastViewedAt) {
          const lastViewedTime = Number(lastViewedAt);

          if (!Number.isNaN(lastViewedTime)) {
            const elapsed = now - lastViewedTime;

            if (elapsed < VIEW_COOLDOWN_MS) {
              return;
            }
          }
        }

        // Marcamos antes de llamar al endpoint para evitar doble conteo en desarrollo.
        localStorage.setItem(storageKey, String(now));

        const response = await fetch(`/api/books/${bookId}/view`, {
          method: "POST",
        });

        if (!response.ok) {
          // Si falló, permitimos que pueda intentar de nuevo después.
          localStorage.removeItem(storageKey);
        }
      } catch {
        // Si falla, no rompemos la página.
      }
    };

    registerView();
  }, [bookId]);

  return null;
}