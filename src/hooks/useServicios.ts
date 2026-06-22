// hooks/useServicios.ts
import { useEffect, useState } from "react";
import { getServicios } from "@/services/servicios/servicioClientService";

export function useServicios() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const data = await getServicios();
        setServicios(data || []);
      } catch (err: any) {
        console.error("Error cargando servicios:", err);
        setError("No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  return { servicios, loading, error };
}