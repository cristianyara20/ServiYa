import { ServicioRepository } from "@/services/servicios/servicio.repository";

const repo = new ServicioRepository();

const estadoColor: Record<string, { color: string; dot: string }> = {
  activo: { color: "text-orange-500 bg-orange-500/10 border-orange-500/30", dot: "bg-orange-500" },
  inactivo: { color: "text-[#555] bg-white/5 border-white/10", dot: "bg-[#555]" },
};

export default async function ServiciosPage() {
  const servicios = await repo.findAll();

  return (
    <div className="min-h-screen bg-[#111009] p-6 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Panel de <span className="text-orange-500">Servicios</span>
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicios.map((s) => {
          const estado = estadoColor[s.estadoServicio] || estadoColor.inactivo;
          return (
          <div
            key={s.idServicio}
            className="group bg-[#1f1609] border border-[#2e1e0a] hover:border-orange-500 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />
            
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-white text-base uppercase tracking-wide">{s.nombreServicio}</p>
              <span className={`text-[11px] font-bold border rounded-full px-2.5 py-0.5 uppercase tracking-wide flex items-center gap-1.5 ${estado.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                {s.estadoServicio}
              </span>
            </div>
            
            <div className="flex items-start gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0 mt-1.5" />
              <span className="text-xs uppercase tracking-widest text-[#555] font-bold shrink-0">Desc.</span>
              <p className="text-sm text-[#ccc] ml-auto text-right leading-tight line-clamp-2">{s.descripcion}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#2e1e0a]">
              <span className="text-sm font-black text-orange-500 uppercase tracking-wide">
                {s.categoria}
              </span>
            </div>
          </div>
        )})}
        {servicios.length === 0 && (
          <p className="text-[#555] font-bold text-sm uppercase py-12 col-span-3 text-center">No hay servicios registrados</p>
        )}
      </div>
    </div>
  );
}