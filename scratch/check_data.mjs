import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  console.log("Auth Users:", authData?.users.slice(0, 2).map(u => ({ id: u.id, email: u.email })));

  const { data: segUsers } = await supabaseAdmin.schema("seguridad").from("usuarios").select("id_usuario, auth_id, correo");
  console.log("Seguridad Usuarios:", segUsers);

  const { data: clientes } = await supabaseAdmin.schema("gestion").from("clientes").select("id_cliente, auth_id");
  console.log("Gestion Clientes:", clientes);

  const { data: reservas } = await supabaseAdmin.schema("gestion").from("reservas").select("id_reserva, id_cliente");
  console.log("Gestion Reservas:", reservas?.slice(0, 5));

  const { data: pqrs } = await supabaseAdmin.schema("soporte").from("pqrs").select("id_pqr, id_cliente");
  console.log("Soporte PQRS:", pqrs?.slice(0, 5));
}
run();
