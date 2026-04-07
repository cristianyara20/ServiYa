"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const tiposPqr = [
  { label: "Peticion", icon: "📋" },
  { label: "Queja", icon: "⚠️" },
  { label: "Reclamo", icon: "🔴" },
  { label: "Sugerencia", icon: "💡" },
];

export default function NuevaPqrsPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [form, setForm] = useState({
    tipoPqr: "",
    descripcion: "",
  });
  const [reservas, setReservas] = useState<any[]>([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<string>("");

  useEffect(() => {
    const fetchReservas = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cliente } = await supabase
        .schema("gestion")
        .from("clientes")
        .select("id_cliente")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (cliente) {
        const { data: reservasData } = await supabase
          .schema("gestion")
          .from("reservas")
          .select("*, servicios(nombre_servicio)")
          .eq("id_cliente", cliente.id_cliente)
          .order("fecha_agenda", { ascending: false });

        if (reservasData) setReservas(reservasData);
      }
    };
    fetchReservas();
  }, [supabase]);

  const handleSubmit = async () => {
    if (!form.tipoPqr || !form.descripcion || !reservaSeleccionada) {
      return alert("Completa todos los campos y selecciona una reserva");
    }

    // 🔥 usuario logueado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert("No autenticado");

    // 🔥 buscar cliente
    const { data: cliente } = await supabase
      .schema("gestion")
      .from("clientes")
      .select("id_cliente")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!cliente) return alert("Cliente no encontrado, crea una reserva primero");

    // 🔥 insertar PQRS
    const { error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .insert({
        id_cliente: cliente.id_cliente,
        id_reserva: Number(reservaSeleccionada),
        tipo_pqr: form.tipoPqr,
        descripcion: form.descripcion,
      });

    if (error) {
      return alert("Error: " + error.message);
    }

    alert("PQRS enviada correctamente");
    router.push("/dashboard/pqrs");
  };

  return (
    <div className="min-h-screen bg-[#111009] flex items-center justify-center p-4">
      <div className="bg-[#1f1609] border border-[#2e1e0a] rounded-2xl p-6 w-full max-w-sm space-y-5">

        {/* TÍTULO */}
        <div className="space-y-0.5">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 font-bold">
            Panel de gestión
          </p>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Nueva <span className="text-orange-500">PQRS</span>
          </h1>
        </div>

        {/* TIPO */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#555] font-bold mb-3">
            Tipo de solicitud
          </p>
          <div className="grid grid-cols-2 gap-2">
            {tiposPqr.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => setForm({ ...form, tipoPqr: label })}
                className={`border rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2
                  ${form.tipoPqr === label
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-[#2e1e0a] text-[#666] hover:border-orange-500/50 hover:text-orange-400/70"
                  }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* RESERVA */}
        {reservas.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-[#555] font-bold mb-2">
              Reserva Asociada
            </p>
            <select
              className="w-full bg-[#111009] border border-[#2e1e0a] focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-[#ccc] outline-none"
              value={reservaSeleccionada}
              onChange={(e) => setReservaSeleccionada(e.target.value)}
            >
              <option value="" disabled>Seleccione una reserva</option>
              {reservas.map(r => (
                <option key={r.id_reserva} value={r.id_reserva}>
                  Reserva #{r.id_reserva} - {r.servicios?.nombre_servicio || "Servicio"} - {new Date(r.fecha_agenda).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DESCRIPCIÓN */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#555] font-bold mb-2">
            Descripción
          </p>
          <textarea
            placeholder="Describe tu solicitud con detalle..."
            rows={5}
            className="w-full bg-[#111009] border border-[#2e1e0a] focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-[#ccc] placeholder-[#444] outline-none resize-none transition-colors"
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        {/* BOTONES */}
        <button
          onClick={handleSubmit}
          className="w-full bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold py-3 rounded-full transition-all text-sm uppercase tracking-wide"
        >
          Enviar PQRS →
        </button>

        <button
          onClick={() => router.push("/dashboard/pqrs")}
          className="w-full border border-[#2e1e0a] hover:border-orange-500/30 text-[#555] hover:text-orange-500/70 text-sm py-2.5 rounded-full transition-all font-medium"
        >
          Cancelar
        </button>

      </div>
    </div>
  );
}