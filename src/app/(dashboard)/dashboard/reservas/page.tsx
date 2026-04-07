"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ReservasPage() {
  const router = useRouter();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const fetchDatosInmediato = async () => {
      try {
        setLoading(true);

        // 1. Obtener el ID de autenticación (el que viene del Login)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Sesión no iniciada");

        console.log("ID de Auth detectado:", user.id);

        // 2. Intentar buscar el cliente en tu esquema 'gestion'
        let { data: cliente, error: clienteError } = await supabase
          .schema("gestion")
          .from("clientes")
          .select("id_cliente")
          .eq("auth_id", user.id)
          .maybeSingle();

        // 3. SOLUCIÓN INMEDIATA: Si no existe, lo creamos en este mismo instante
        if (!cliente) {
          console.warn("Cliente no existe en BD. Creando perfil ahora mismo...");

          const nuevoIdManual = Math.floor(Math.random() * 900000) + 100000;

          const { data: nuevoCliente, error: insertError } = await supabase
            .schema("gestion")
            .from("clientes")
            .insert({
              id_cliente: nuevoIdManual,
              auth_id: user.id,
              // Si tienes campos de nombre o email, agrégalos aquí:
              // nombre: user.user_metadata.full_name || 'Nuevo Usuario'
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error fatal al crear cliente:", insertError.message);
            throw insertError;
          }

          cliente = nuevoCliente;
          console.log("Perfil creado con éxito:", cliente.id_cliente);
        }

        // 4. Cargar reservas con el ID que ya tenemos garantizado
        const { data: reservasData, error: reservasError } = await supabase
          .schema("gestion")
          .from("reservas")
          .select("*, servicios(nombre_servicio)")
          .eq("id_cliente", cliente.id_cliente)
          .order("fecha_agenda", { ascending: false });

        if (reservasError) throw reservasError;

        setReservas(reservasData || []);

      } catch (err: any) {
        console.error("ERROR CRÍTICO:", err.message);
        // Si sale error aquí, es por falta de permisos en Supabase (RLS)
      } finally {
        setLoading(false);
      }
    };

    fetchDatosInmediato();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#111009] p-6 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Mis <span className="text-orange-500">Citas</span>
        </h1>
        <button
          onClick={() => router.push("/dashboard/reservas/nueva")}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-full transition-all"
        >
          + Nueva reserva
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="animate-pulse text-orange-500 font-bold">Verificando usuario y cargando datos...</p>
        ) : reservas.length === 0 ? (
          <p className="text-gray-500">No se encontraron reservas para este perfil.</p>
        ) : (
          reservas.map((r) => (
            <div key={r.id_reserva} className="bg-[#1f1609] border border-[#2e1e0a] p-5 rounded-2xl border-l-4 border-l-orange-500">
              <p className="text-orange-500 font-black mb-2">RESERVA #{r.id_reserva}</p>
              <p className="text-sm text-gray-400">Fecha: {new Date(r.fecha_agenda).toLocaleDateString()}</p>
              <p className="text-sm text-gray-400">Servicio: {r.servicios?.nombre_servicio || 'N/A'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}