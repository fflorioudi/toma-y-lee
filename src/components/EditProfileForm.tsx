"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  initialName: string;
  initialLastName: string;
};

export default function EditProfileForm({
  initialName,
  initialLastName,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [lastName, setLastName] = useState(initialLastName);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tenés que iniciar sesión.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("users_profile")
      .update({
        name,
        last_name: lastName,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Perfil actualizado correctamente ✅");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} style={{ marginTop: "1rem", maxWidth: "500px" }}>
      {message && <p style={{ marginBottom: "1rem" }}>{message}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.4rem",
            padding: "0.7rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="lastName">Apellido</label>
        <input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.4rem",
            padding: "0.7rem",
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
        {loading ? "Guardando..." : "Guardar datos"}
      </button>
    </form>
  );
}