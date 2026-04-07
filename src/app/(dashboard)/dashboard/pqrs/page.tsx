"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type EstadoType = "Abierto" | "En Proceso" | "Cerrado";
type TipoType = "Peticion" | "Queja" | "Reclamo" | "Sugerencia";

const estadoConfig: Record<EstadoType, { color: string; dot: string }> = {
  "Abierto":    { color: "text-orange-500 bg-orange-500/10 border-orange-500/30", dot: "bg-orange-500" },
  "En Proceso": { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", dot: "bg-yellow-400" },
  "Cerrado":    { color: "text-[#555] bg-white/5 border-white/10",                dot: "bg-[#555]" },
};

const tipoConfig: Record<TipoType, { icon: string; color: string }> = {
  "Peticion":   { icon: "📋", color: "text-blue-400" },
  "Queja":      { icon: "⚠️", color: "text-orange-400" },
  "Reclamo":    { icon: "🔴", color: "text-red-400" },
  "Sugerencia": { icon: "💡", color: "text-yellow-400" },
};

const defaultPqrs: { id: number; tipo: TipoType; descripcion: string; cliente: number; estado: EstadoType }[] = [
  { id: 1,  tipo: "Peticion",   descripcion: "Solicitud información",  cliente: 1,  estado: "Abierto" },
  { id: 2,  tipo: "Queja",      descripcion: "Demora en servicio",     cliente: 2,  estado: "En Proceso" },
];

export default function PqrsPage() {
  const router = useRouter();
  const [pqrs, setPqrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const fetchPqrs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cliente } = await supabase
          .schema("gestion")
          .from("clientes")
          .select("id_cliente")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (cliente) {
          const { data: pqrsData } = await supabase
            .schema("soporte")
            .from("pqrs")
            .select("*")
            .eq("id_cliente", cliente.id_cliente);

          if (pqrsData) setPqrs(pqrsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPqrs();
  }, []);

  return (
    <div className="min-h-screen bg-[#111009] p-6">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 font-bold mb-1">
            Panel de gestión
          </p>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none">
            PQ<span className="text-orange-500">RS</span>
          </h1>
        </div>
        <button
          onClick={() => router.push("/dashboard/pqrs/nueva")}
          className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all mt-1"
        >
          + Nueva PQRS
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total",      value: pqrs.length,                                        color: "text-white" },
          { label: "Abiertos",   value: pqrs.filter(p => p.estado_pqr === "Abierto" || !p.estado_pqr).length,    color: "text-orange-500" },
          { label: "En Proceso", value: pqrs.filter(p => p.estado_pqr === "En Proceso").length, color: "text-yellow-400" },
          { label: "Cerrados",   value: pqrs.filter(p => p.estado_pqr === "Cerrado").length,    color: "text-[#555]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1f1609] border border-[#2e1e0a] rounded-2xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-[#555] font-bold mb-0.5">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-[#ccc] text-sm font-bold">Cargando tus PQRS...</p>}
        {!loading && pqrs.length === 0 && <p className="text-[#ccc] text-sm font-bold">No tienes PQRS registradas.</p>}
        {pqrs.map((p) => {
          const estado = estadoConfig[p.estado_pqr as EstadoType] || estadoConfig["Abierto"];
          const tipo = tipoConfig[p.tipo_pqr as TipoType] || tipoConfig["Queja"];
          return (
            <div
              key={p.id_pqr}
              onClick={() => router.push(`/dashboard/pqrs/${p.id_pqr}`)}
              className="group bg-[#1f1609] border border-[#2e1e0a] hover:border-orange-500 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />

              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-white text-base uppercase tracking-wide">
                  PQRS #{p.id_pqr}
                </span>
                <span className={`text-[11px] font-bold border rounded-full px-2.5 py-0.5 uppercase tracking-wide flex items-center gap-1.5 ${estado.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                  {p.estado_pqr || "Abierto"}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0" />
                <span className="text-xs uppercase tracking-widest text-[#555] font-bold">Tipo</span>
                <span className={`text-sm font-bold ml-auto flex items-center gap-1 ${tipo.color}`}>
                  {tipo.icon} {p.tipo_pqr}
                </span>
              </div>

              <div className="flex items-start gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0 mt-1.5" />
                <span className="text-xs uppercase tracking-widest text-[#555] font-bold shrink-0">Desc.</span>
                <span className="text-sm text-[#ccc] ml-auto text-right leading-tight">{p.descripcion}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0" />
                <span className="text-xs uppercase tracking-widest text-[#555] font-bold">Reserva</span>
                <span className="text-sm font-semibold text-[#ccc] ml-auto">#{p.id_reserva}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2e1e0a] flex items-center justify-between">
                <span className="text-[11px] text-[#444] uppercase tracking-widest font-bold">Ver detalle</span>
                <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <span className="text-orange-500 text-xs font-black">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}