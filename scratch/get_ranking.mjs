import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env", "utf-8");
const lines = env.split("\n");
let url = "";
let key = "";
lines.forEach(line => {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) url = line.split("=")[1].trim();
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=")) key = line.split("=")[1].trim();
});

const supabaseAdmin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  const { data: todasCompletadas, error } = await supabaseAdmin
    .schema('gestion')
    .from('reservas')
    .select('id_prestador')
    .eq('estado_reserva', 'terminada')
    .not('id_prestador', 'is', null);

  if (error) { console.error("Error fetching reservas:", error); return; }

  const counts = {};
  todasCompletadas?.forEach(r => {
    const pid = r.id_prestador;
    if (!counts[pid]) counts[pid] = { id: pid, completadas: 0 };
    counts[pid].completadas++;
  });

  const ranking = Object.values(counts).sort((a, b) => b.completadas - a.completadas);

  const ids = ranking.map(r => r.id);
  
  if (ids.length > 0) {
    const { data: usuarios } = await supabaseAdmin
      .schema('seguridad')
      .from('usuarios')
      .select('id_usuario, nombre, apellido')
      .in('id_usuario', ids);
      
    ranking.forEach(r => {
      const u = usuarios?.find(user => user.id_usuario === r.id);
      r.nombre = u ? `${u.nombre} ${u.apellido || ''}`.trim() : `Prestador #${r.id}`;
    });
  }

  console.log("Ranking:", ranking);
}
run();
