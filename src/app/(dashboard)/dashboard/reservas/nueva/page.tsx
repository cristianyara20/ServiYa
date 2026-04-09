"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useCliente } from "@/hooks/useCliente";

const servicios = [
  { id: 1, nombre: "Plomería y Agua", icono: "🔧" },
  { id: 2, nombre: "Electricidad", icono: "⚡" },
  { id: 3, nombre: "Gas", icono: "🔥" },
  { id: 4, nombre: "Carpintería", icono: "🪵" },
  { id: 5, nombre: "Pintura", icono: "🎨" },
  { id: 6, nombre: "Aire Acondicionado", icono: "❄️" },
];

const subServicios: Record<number, { label: string; opciones: string[] }> = {
  1: {
    label: "Tipo de trabajo de plomería",
    opciones: ["Reparación de tuberías", "Fugas de agua", "Instalación de grifos", "Destape de cañerías"],
  },
  2: {
    label: "Tipo de trabajo eléctrico",
    opciones: ["Corto circuito", "Cambio de enchufes", "Instalación eléctrica"],
  },
  3: {
    label: "Tipo de servicio de gas",
    opciones: ["Revisión de fugas", "Instalación de gas"],
  },
  4: {
    label: "Tipo de trabajo de carpintería",
    opciones: ["Reparación de muebles", "Puertas"],
  },
  5: {
    label: "Tipo de pintura",
    opciones: ["Interior", "Exterior"],
  },
  6: {
    label: "Tipo de aire acondicionado",
    opciones: ["Mantenimiento", "Instalación"],
  },
};

export default function NuevaReservaPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const { clienteId } = useCliente();

  const [servicioSeleccionado, setServicioSeleccionado] = useState<number | null>(null);
  const [subServicioSeleccionado, setSubServicioSeleccionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    detalleExtra: "",
  });

  const handleAgendar = async () => {
    if (!form.nombre || !form.telefono || !form.direccion || !servicioSeleccionado || !subServicioSeleccionado) {
      return alert("Completa todos los campos");
    }

    setLoading(true);

    try {
      if (!clienteId) {
        setLoading(false);
        return alert("Error: Perfil de cliente no encontrado o cargando");
      }

      // 3. INSERTAR RESERVA (CORRECCIÓN DE ESQUEMA)
      const { error: errorReserva } = await supabase
        .schema("gestion")
        .from("reservas")
        .insert({
          id_cliente: clienteId,
          id_prestador: null, // Se deja null para que aparezca en el mercado general de solicitudes pendientes
          id_servicio: servicioSeleccionado,
          direccion: form.direccion,
          descripcion: `${subServicioSeleccionado}: ${form.detalleExtra}`,
          fecha_agenda: new Date().toISOString(),
        });

      if (errorReserva) throw errorReserva;

      alert("✅ Cita agendada correctamente");
      router.push("/dashboard/reservas");

    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "No se pudo completar la reserva"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111009] flex items-center justify-center p-4">
      <div className="bg-[#1f1609] border border-[#2e1e0a] rounded-2xl shadow-md p-6 w-full max-w-sm space-y-4">

        <div className="space-y-0.5 mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 font-bold">Citas</p>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Agendar <span className="text-orange-500">Cita</span>
          </h1>
        </div>

        <input
          type="text"
          placeholder="Nombre"
          className="w-full bg-[#111009] border border-[#2e1e0a] focus:border-orange-500 rounded-xl px-4 py-2 text-sm text-[#ccc] outline-none transition-all"
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          type="tel"
          placeholder="Teléfono"
          className="w-full bg-[#111009] border border-[#2e1e0a] focus:border-orange-500 rounded-xl px-4 py-2 text-sm text-[#ccc] outline-none transition-all"
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />

        <input
          type="text"
          placeholder="Dirección"
          className="w-full bg-[#111009] border border-[#2e1e0a] focus:border-orange-500 rounded-xl px-4 py-2 text-sm text-[#ccc] outline-none transition-all"
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />

        <div>
          <p className="text-xs uppercase tracking-widest text-[#555] font-bold mb-2">Tipo de Servicio</p>
          <div className="grid grid-cols-2 gap-3">
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServicioSeleccionado(s.id);
                  setSubServicioSeleccionado(null);
                }}
                className={`flex flex-col items-center justify-center border rounded-xl py-4 text-sm font-bold transition-all
                  ${servicioSeleccionado === s.id
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-[#2e1e0a] text-[#666] hover:border-orange-500/50"
                  }`}
              >
                <span className="text-2xl mb-1">{s.icono}</span>
                {s.nombre}
              </button>
            ))}
          </div>
        </div>

        {servicioSeleccionado && (
          <div className="animate-in fade-in slide-in-from-top-1">
            <label className="text-xs uppercase tracking-widest text-[#555] font-bold">
              {subServicios[servicioSeleccionado]?.label}
            </label>
            <select
              className="w-full mt-2 bg-[#111009] border border-[#2e1e0a] focus:border-orange-500 rounded-xl px-4 py-2 text-sm text-[#ccc] outline-none"
              onChange={(e) => setSubServicioSeleccionado(e.target.value)}
              value={subServicioSeleccionado || ""}
            >
              <option value="" disabled>Selecciona una opción</option>
              {subServicios[servicioSeleccionado].opciones.map((op, i) => (
                <option key={i} value={op}>{op}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleAgendar}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-400/50 text-white font-bold py-3 rounded-full transition-all text-sm uppercase tracking-wide mt-4"
        >
          {loading ? "Guardando..." : "Guardar Cita →"}
        </button>

        <button
          onClick={() => router.push("/dashboard/reservas")}
          className="w-full border border-[#2e1e0a] hover:border-orange-500/30 text-[#555] hover:text-orange-500/70 text-sm py-2.5 rounded-full transition-all font-medium mt-2"
        >
          Cancelar
        </button>

      </div>
    </div>
  );
}