"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ActualizarClavePage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sesionLista, setSesionLista] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // Intentar capturar token del hash de la URL
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!error) {
            setSesionLista(true);
            return;
          }
        }
      }

      // Si no hay hash, verificar sesión existente
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSesionLista(true);
        return;
      }

      // Escuchar evento PASSWORD_RECOVERY
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setSesionLista(true);
        }
      });

      return () => subscription.unsubscribe();
    };

    init();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sesionLista) {
      return setMensaje({ tipo: "error", texto: "Sesión no lista. Solicita un nuevo correo de recuperación." });
    }

    if (password !== confirmPassword) {
      return setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden" });
    }

    if (password.length < 6) {
      return setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres" });
    }

    setLoading(true);
    setMensaje({ tipo: "", texto: "" });

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      setLoading(false);
    } else {
      setMensaje({ tipo: "success", texto: "✅ ¡Contraseña actualizada con éxito!" });
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 text-white">
      <form onSubmit={handleUpdate} className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Nueva <span className="text-orange-500">Contraseña</span>
        </h1>

        {!sesionLista && (
          <div className="p-3 rounded text-xs text-center bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            ⏳ Verificando sesión...
          </div>
        )}

        {mensaje.texto && (
          <div className={`p-3 rounded text-xs text-center ${mensaje.tipo === "error"
            ? "bg-red-500/10 text-red-500 border border-red-500/20"
            : "bg-green-500/10 text-green-500 border border-green-500/20"}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            required
            disabled={!sesionLista}
            className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-orange-500 disabled:opacity-50"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Repetir contraseña"
            required
            disabled={!sesionLista}
            className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-orange-500 disabled:opacity-50"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading || !sesionLista}
          className="w-full bg-orange-500 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-orange-400 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Actualizar ahora"}
        </button>

        {!sesionLista && (
          <p className="text-xs text-center text-neutral-500">
            Si el problema persiste,{" "}
            <a href="/auth/recuperar" className="text-orange-400 underline">
              solicita un nuevo correo
            </a>
          </p>
        )}
      </form>
    </main>
  );
}