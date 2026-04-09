const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = 'https://lvxhporsajorgckeisna.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eGhwb3JzYWpvcmdja2Vpc25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQyNTIzNSwiZXhwIjoyMDg5MDAxMjM1fQ.2jGgr7tocFeq1QSsLdzUZBQ3sA_PytrNhbBiJBEcPPg';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugReviews() {
  try {
    console.log("--- DEBUG REVIEWS ---");
    
    // 1. Get all calificaciones
    const { data: cal, error: errCal } = await supabase.schema('gestion').from('calificaciones').select('*');
    console.log(`Pre-count: ${cal?.length} calificaciones found.`);

    // 2. Get all reservas
    const { data: res, error: errRes } = await supabase.schema('gestion').from('reservas').select('*');
    console.log(`Pre-count: ${res?.length} reservas found.`);

    // 3. Look for a specific user's citations
    // Let's try to find citations for 'yaracristian200@gmail.com'
    // First find their ID in seguridad.usuarios
    const { data: users } = await supabase.schema('seguridad').from('usuarios').select('*');
    const targetUser = users.find(u => u.correo === 'yaracristian200@gmail.com');
    
    if (targetUser) {
      console.log(`Target User: ${targetUser.nombre} (ID: ${targetUser.id_usuario})`);
      const userRes = res.filter(r => r.id_usuario === targetUser.id_usuario || r.id_cliente === targetUser.id_usuario);
      console.log(`User Reservas: ${userRes.length}`);
      userRes.forEach(r => {
        const matchingCal = cal.filter(c => c.id_reserva === r.id_reserva);
        console.log(`Reserva #${r.id_reserva} has ${matchingCal.length} reviews.`);
      });
    }

    // 4. Sample a few calificiaciones to see their id_reserva
    console.log("Sample Calificaciones:");
    cal.slice(0, 5).forEach(c => console.log(`Cal ID: ${c.id_calificacion}, Res ID: ${c.id_reserva}, Puntos: ${c.puntuacion}`));

  } catch (e) {
    console.error(e);
  }
}

debugReviews();
