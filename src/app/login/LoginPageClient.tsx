"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPageClient() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const confirmed = searchParams.get("confirmed");

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!name.trim() || !lastName.trim()) {
      setMessage("Completá nombre y apellido.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setMessage("Ingresá un correo válido.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase
        .from("users_profile")
        .update({
          name: name.trim(),
          last_name: lastName.trim(),
        })
        .eq("id", userId);

      if (profileError) {
        setMessage(
          "La cuenta se creó, pero hubo un problema al guardar nombre y apellido."
        );
        setIsSuccess(false);
        setLoading(false);
        return;
      }
    }

    setMessage("Te enviamos un correo para confirmar tu cuenta.");
    setIsSuccess(true);
    setLoading(false);
    setName("");
    setLastName("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setMessage("Ingresá un correo válido.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="page-container">
      <section className="card" style={{ maxWidth: "520px", margin: "3rem auto 0" }}>
        <h1
          className="section-title"
          style={{ marginBottom: "0.5rem", color: "var(--accent)" }}
        >
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h1>

        {confirmed === "true" && (
          <p className="message-success">
            Tu correo fue confirmado. Ya podés iniciar sesión.
          </p>
        )}

        {message && (
          <p className={isSuccess ? "message-success" : "message-error"}>
            {message}
          </p>
        )}

        <form
          onSubmit={isRegister ? handleRegister : handleLogin}
          className="form-grid"
          style={{ marginTop: "1rem" }}
        >
          {isRegister && (
            <>
              <div className="form-field">
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                />
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Apellido</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={isRegister}
                />
              </div>
            </>
          )}

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

          <div className="form-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {!isRegister && (
            <div style={{ marginTop: "-0.25rem" }}>
              <Link
                href="/forgot-password"
                style={{
                  color: "var(--accent)",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                Olvidé mi contraseña
              </Link>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Procesando..."
              : isRegister
              ? "Registrarme"
              : "Ingresar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
            setIsSuccess(false);
          }}
          style={{
            marginTop: "1rem",
            width: "100%",
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
        >
          {isRegister
            ? "Ya tengo cuenta"
            : "No tengo cuenta, quiero registrarme"}
        </button>
      </section>
    </main>
  );
}