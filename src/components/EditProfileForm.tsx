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
  const [isSuccess, setIsSuccess] = useState(false);
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
      setIsSuccess(false);
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
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setMessage("Perfil actualizado correctamente");
    setIsSuccess(true);
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "1rem", maxWidth: "520px" }}>
      {message && (
        <p className={isSuccess ? "message-success" : "message-error"}>
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