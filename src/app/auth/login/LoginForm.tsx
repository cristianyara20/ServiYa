"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("usuario");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    try {
      if (data?.user) {
        // Consultar el rol del usuario en la tabla de usuarios
        const { data: dbUser, error: roleError } = await supabase
          .schema("seguridad")
          .from("usuarios")
          .select("rol")
          .eq("auth_id", data.user.id)
          .single();

        if (roleError) {
          console.error("Error fetching role:", JSON.stringify(roleError, null, 2));
        }

        const userRole = (dbUser as any)?.rol || "usuario";

        // Validar que el rol seleccionado coincida con el rol real
        if (userRole !== rol) {
          await supabase.auth.signOut();
          setError(`Tu cuenta no tiene el rol de "${rol === "admin" ? "Administrador" : rol === "prestador" ? "Prestador" : "Usuario"}". Selecciona el rol correcto.`);
          setLoading(false);
          return;
        }

        // Redirigir según el rol real de la base de datos
        if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else if (userRole === "prestador") {
          router.push("/dashboard/prestador");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Redirection error:", err);
      router.push("/dashboard");
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-300">Entrar como</label>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="usuario">Usuario / Cliente</option>
          <option value="prestador">Prestador de Servicios</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-300">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tucorreo@email.com"
          className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 placeholder:text-neutral-500 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-300">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 placeholder:text-neutral-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors text-sm mt-2"
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}