import { ChatRepository } from "@/services/chats/chat.repository";

const repo = new ChatRepository();

export default async function ChatPage() {
  const chats = await repo.findAll();

  return (
    <div className="min-h-screen bg-[#111009] p-6 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Bandeja de <span className="text-orange-500">Chats</span>
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chats.map((chat) => (
          <div
            key={chat.idChat}
            className="group bg-[#1f1609] border border-[#2e1e0a] hover:border-orange-500 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />
            
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-white text-base uppercase tracking-wide">
                Chat #{chat.idChat}
              </p>
              <span className="text-[11px] font-bold text-orange-500 bg-orange-500/10 border border-orange-500/30 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                Activo
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0" />
              <span className="text-xs uppercase tracking-widest text-[#555] font-bold">Cliente</span>
              <span className="text-sm font-semibold text-[#ccc] ml-auto">#{chat.idCliente}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0" />
              <span className="text-xs uppercase tracking-widest text-[#555] font-bold">Prestador</span>
              <span className="text-sm font-semibold text-[#ccc] ml-auto">#{chat.idPrestador}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-[#2e1e0a]">
              <span className="text-[11px] uppercase tracking-widest text-[#555] font-bold">
                {new Date(chat.fechaInicio).toLocaleDateString("es-CO")}
              </span>
            </div>
          </div>
        ))}
        {chats.length === 0 && (
          <p className="text-[#555] font-bold text-sm uppercase py-12 col-span-3 text-center">No hay chats registrados</p>
        )}
      </div>
    </div>
  );
}