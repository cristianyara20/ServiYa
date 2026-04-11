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
          // Si no existe en gestión, necesitamos crearlo saltando RLS (usando Server Action)
          const { syncClienteProfile } = await import("@/app/actions/cliente");
          const syncResult = await syncClienteProfile(user.id);
          
          if (syncResult.error || !syncResult.id_cliente) {
             throw new Error(syncResult.error || "No se pudo sincronizar el perfil base de datos");
          }
          
          idClienteFinal = syncResult.id_cliente;
        } else {
          idClienteFinal = cliente.id_cliente;
        }

        if (isMounted) {
          setClienteId(idClienteFinal);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error en useCliente:", JSON.stringify(err, null, 2));
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
