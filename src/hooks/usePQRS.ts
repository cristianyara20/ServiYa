import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useCliente } from "./useCliente";

export function usePQRS() {
  const { clienteId, loading: loadingCliente, error: errorCliente } = useCliente();
  const [pqrs, setPqrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPQRS = useCallback(async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const { data: pqrsData, error: pqrsError } = await supabase
        .schema("soporte")
        .from("pqrs")
        .select("*")
        .eq("id_cliente", clienteId)
        .order("id_pqr", { ascending: false });

      if (pqrsError) throw pqrsError;
      setPqrs(pqrsData || []);
      setError(null);
    } catch (err: any) {
      console.error("Error al obtener PQRS:", err);
      setError(err?.message || "No se pudieron cargar las PQRS");
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    if (loadingCliente) {
      setLoading(true);
      return;
    }
    
    if (errorCliente) {
      setError(errorCliente);
      setLoading(false);
      return;
    }

    if (clienteId) {
      fetchPQRS();
    }
  }, [clienteId, loadingCliente, errorCliente, fetchPQRS]);

  return { pqrs, loading, error, refetch: fetchPQRS };
}
