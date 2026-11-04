"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
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
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error en callback de autenticación:", error);
        router.push("/auth/login");
      }
    };

    void handleAuth();
  }, [router]);

  return <h2>Autenticando...</h2>;
}
