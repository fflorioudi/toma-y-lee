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
    <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "1rem", maxWidth: "520px" }}>
      {message && (
        <p
          style={{
            marginBottom: "0.5rem",
            color: message.includes("✅") ? "var(--accent)" : "var(--text)",
          }}
        >
          {message}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="lastName">Apellido</label>
        <input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar datos"}
      </button>
    </form>
  );
}