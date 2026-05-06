"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (cooldown > 0) {
      setMessage(`Esperá ${cooldown}s antes de pedir otro enlace.`);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

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

    setMessage(
      "Te enviamos un correo para restablecer tu contraseña. Si no lo ves en unos minutos, revisá también la carpeta de spam o correo no deseado."
    );
    setIsSuccess(true);
    setLoading(false);
    setCooldown(60);
  };

  return (
    <main className="page-container">
      <section
        className="card"
        style={{ maxWidth: "520px", margin: "3rem auto 0" }}
      >
        <h1
          className="section-title"
          style={{ marginBottom: "0.5rem", color: "var(--accent)" }}
        >
          Recuperar contraseña
        </h1>

        {message && (
          <p className={isSuccess ? "message-success" : "message-error"}>
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="form-grid"
          style={{ marginTop: "1rem" }}
        >
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