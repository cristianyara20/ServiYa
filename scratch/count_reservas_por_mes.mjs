import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const lines = env.split('\n');
let url = '';
let key = '';
lines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  // Get ALL reservas
  const { data, error, count } = await supabase
    .schema('gestion')
    .from('reservas')
    .select('id_reserva, estado_reserva, fecha_agenda', { count: 'exact' });

  if (error) { console.error("Error:", error); return; }

  console.log(`\n=== TOTAL DE RESERVAS: ${count} ===\n`);

  // Group by month and estado
  const byMonth = {};
  const byEstado = {};
  
  data.forEach(r => {
    const date = new Date(r.fecha_agenda);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!byMonth[monthKey]) byMonth[monthKey] = { total: 0, pendiente: 0, aceptada: 0, rechazada: 0, terminada: 0 };
    byMonth[monthKey].total++;
    byMonth[monthKey][r.estado_reserva] = (byMonth[monthKey][r.estado_reserva] || 0) + 1;

    byEstado[r.estado_reserva] = (byEstado[r.estado_reserva] || 0) + 1;
  });

  console.log("=== TOTALES POR ESTADO ===");
  Object.entries(byEstado).sort().forEach(([estado, count]) => {
    console.log(`  ${estado}: ${count}`);
  });

  console.log("\n=== DESGLOSE POR MES ===");
  Object.keys(byMonth).sort().forEach(month => {
    const m = byMonth[month];
    console.log(`\n  ${month} (Total: ${m.total})`);
    console.log(`    pendiente: ${m.pendiente}`);
    console.log(`    aceptada:  ${m.aceptada}`);
    console.log(`    rechazada: ${m.rechazada}`);
    console.log(`    terminada: ${m.terminada}`);
  });
}
run();
