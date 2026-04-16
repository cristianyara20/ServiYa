import { useState, useEffect } from "react";
import { getAuthUser, getClienteByAuthId } from "@/services/cliente/clienteService";

export function useCliente() {
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCliente = async () => {
      try {
        // 1. Obtener usuario logueado (via Service)
        const authUser = await getAuthUser();
        
        if (!authUser) {
          if (isMounted) {
            setLoading(false);
            setError("No estás autenticado o la sesión ha expirado.");
          }
          return;
        }

        if (isMounted) setUser(authUser);

        // 2. Buscamos en gestion.clientes (via Service)
        const cliente = await getClienteByAuthId(authUser.id);

        let idClienteFinal: number;

        if (!cliente) {
          console.warn("Cliente no existe en gestion. Creando perfil a partir de seguridad...");
          // Si no existe en gestión, sincronizar via Server Action (en Services)
          const { syncClienteProfile } = await import("@/services/cliente/cliente.actions");
          const syncResult = await syncClienteProfile(authUser.id);
          
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
