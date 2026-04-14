import { useState, useEffect, useCallback } from "react";
import { getReservasByCliente } from "@/services/reservas/reservaClientService";
import { useCliente } from "./useCliente";

export function useReservas() {
  const { clienteId, loading: loadingCliente, error: errorCliente } = useCliente();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = useCallback(async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const reservasData = await getReservasByCliente(clienteId);
      setReservas(reservasData);
      setError(null);
    } catch (err: any) {
      console.error("Error al obtener reservas:", err);
      setError(err?.message || "No se pudieron cargar las reservas");
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
      fetchReservas();
    }
  }, [clienteId, loadingCliente, errorCliente, fetchReservas]);

  return { reservas, loading, error, refetch: fetchReservas };
}
