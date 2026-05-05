"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setMessage("Ingresá un correo válido.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setMessage("Te enviamos un correo para restablecer tu contraseña.");
    setIsSuccess(true);
    setLoading(false);
    startCooldown();
  };

  return (
    <main className="page-container">
      <section className="card" style={{ maxWidth: "520px", margin: "3rem auto 0" }}>
        <h1
          className="section-title"
          style={{ marginBottom: "0.5rem", color: "var(--accent)" }}
        >
          Recuperar contraseña
        </h1>

        <p className="subtle-text" style={{ marginTop: 0 }}>
          Ingresá tu correo y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        {message && (
          <p className={isSuccess ? "message-success" : "message-error"}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1rem" }}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading || cooldown > 0}>
            {loading
              ? "Enviando..."
              : cooldown > 0
              ? `Esperá ${cooldown}s`
              : "Enviar enlace"}
          </button>
        </form>
      </section>
    </main>
  );
}