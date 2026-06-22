"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getSession();

      const user = data.session?.user;

      if (user) {
        // 🔥 insertar en tu tabla personalizada
        await supabase.schema("seguridad").from("usuarios").upsert({
          correo: user.email || "",
          nombre: "Usuario",
          apellido: "Nuevo",
          fecha_nacimiento: "2000-01-01",
          auth_id: user.id,
        });

        router.push("/dashboard");
      }
    };

    handleAuth();
  }, []);

  return <h2>Autenticando...</h2>;
}