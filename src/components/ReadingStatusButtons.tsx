"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ReadingStatus = "reading" | "read";

type Props = {
  bookId: string;
  initialStatus: ReadingStatus | null;
  initialReadingCount: number;
  initialReadCount: number;
};

export default function ReadingStatusButtons({
  bookId,
  initialStatus,
  initialReadingCount,
  initialReadCount,
}: Props) {
  const supabase = createClient();

  const [status, setStatus] = useState<ReadingStatus | null>(initialStatus);
  const [readingCount, setReadingCount] = useState(initialReadingCount);
  const [readCount, setReadCount] = useState(initialReadCount);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateLocalCounts = (
    previousStatus: ReadingStatus | null,
    nextStatus: ReadingStatus | null
  ) => {
    if (previousStatus === "reading") {
      setReadingCount((count) => Math.max(0, count - 1));
    }

    if (previousStatus === "read") {
      setReadCount((count) => Math.max(0, count - 1));
    }

    if (nextStatus === "reading") {
      setReadingCount((count) => count + 1);
    }

    if (nextStatus === "read") {
      setReadCount((count) => count + 1);
    }
  };

  const handleStatusClick = async (nextStatus: ReadingStatus) => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que iniciar sesión para guardar tu lectura.");
      setLoading(false);
      return;
    }

    const previousStatus = status;
    const finalStatus = previousStatus === nextStatus ? null : nextStatus;

    if (finalStatus === null) {
      const { error } = await supabase
        .from("reading_statuses")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setStatus(null);
      updateLocalCounts(previousStatus, null);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reading_statuses").upsert(
      {
        user_id: user.id,
        book_id: bookId,
        status: finalStatus,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,book_id",
      }
    );

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setStatus(finalStatus);
    updateLocalCounts(previousStatus, finalStatus);
    setLoading(false);
  };

  return (
    <div className="top-space">
      <div className="actions-row" style={{ gap: "0.6rem" }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleStatusClick("reading")}
          style={{
            background: status === "reading" ? "var(--accent)" : "var(--surface)",
            color: status === "reading" ? "var(--white)" : "var(--text)",
            border:
              status === "reading"
                ? "1px solid var(--accent)"
                : "1px solid var(--border)",
          }}
        >
          Lo estoy leyendo
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleStatusClick("read")}
          style={{
            background: status === "read" ? "var(--accent)" : "var(--surface)",
            color: status === "read" ? "var(--white)" : "var(--text)",
            border:
              status === "read"
                ? "1px solid var(--accent)"
                : "1px solid var(--border)",
          }}
        >
          Lo leí
        </button>
      </div>

     <p className="subtle-text" style={{ marginTop: "0.7rem" }}>
  {readingCount === 1
    ? "1 persona lo está leyendo"
    : `${readingCount} personas lo están leyendo`}{" "}
  ·{" "}
  {readCount === 1
    ? "1 persona lo leyó"
    : `${readCount} personas lo leyeron`}
</p>

      {message && <p className="message-error">{message}</p>}
    </div>
  );
}