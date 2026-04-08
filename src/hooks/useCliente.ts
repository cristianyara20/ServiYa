import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function useCliente() {
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCliente = async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        
        // 1. Obtener usuario logueado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          if (isMounted) {
            setLoading(false);
            setError("No estás autenticado o la sesión ha expirado.");
          }
          return;
        }

        if (isMounted) setUser(user);

        // 2. Buscamos primero en el esquema gestion
        let { data: cliente, error: errorCliente } = await supabase
          .schema("gestion")
          .from("clientes")
          .select("id_cliente")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (errorCliente) throw errorCliente;

        let idClienteFinal: number;

        if (!cliente) {
          console.warn("Cliente no existe en gestion. Creando perfil a partir de seguridad...");
          // Si no existe en gestión, necesitamos su ID del esquema seguridad
          const { data: usuarioSeg, error: errorSeg } = await supabase
            .schema("seguridad")
            .from("usuarios")
            .select("id_usuario")
            .eq("auth_id", user.id)
            .single();

          if (errorSeg || !usuarioSeg) {
            // Como fallback si no está en seguridad tampoco (por alguna razón rara)
            console.error("No se encontró el perfil en seguridad, generando ID temporal...");
             const nuevoIdManual = Math.floor(Math.random() * 900000) + 100000;
             const { data: nuevoClienteAlt, error: insertErrorAlt } = await supabase
              .schema("gestion")
              .from("clientes")
              .insert({
                id_cliente: nuevoIdManual,
                auth_id: user.id,
              })
              .select()
              .single();
              
              if(insertErrorAlt) throw insertErrorAlt;
              idClienteFinal = nuevoClienteAlt.id_cliente;
          } else {
            // Creamos el cliente en el esquema gestión con el id de seguridad
            const { data: nuevoCliente, error: errorInsert } = await supabase
              .schema("gestion")
              .from("clientes")
              .insert({
                id_cliente: usuarioSeg.id_usuario,
                auth_id: user.id
              })
              .select()
              .single();

            if (errorInsert) throw errorInsert;
            idClienteFinal = nuevoCliente.id_cliente;
          }
        } else {
          idClienteFinal = cliente.id_cliente;
        }

        if (isMounted) {
          setClienteId(idClienteFinal);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error en useCliente:", err);
        if (isMounted) setError(err?.message || "Error desconocido al obtener perfil.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCliente();

    return () => {
      isMounted = false;
    };
  }, []);

  return { clienteId, user, loading, error };
}
