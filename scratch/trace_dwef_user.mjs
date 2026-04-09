import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

const AUTH_ID = "de590248-ba3a-4c96-a8ad-37cbc17d8624";

async function traceUser() {
    console.log("=== TRACING AUTH_ID:", AUTH_ID, "===\n");

    // 1. Find in seguridad.usuarios by auth_id
    const { data: byAuthId } = await supabase.schema('seguridad').from('usuarios')
        .select('*').eq('auth_id', AUTH_ID);
    console.log("1. seguridad.usuarios WHERE auth_id =", AUTH_ID, ":");
    console.table(byAuthId);

    // 2. Find by email from auth
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(AUTH_ID);
    console.log("2. Auth user email:", authUser?.email);

    if (authUser?.email) {
        const { data: byEmail } = await supabase.schema('seguridad').from('usuarios')
            .select('*').eq('correo', authUser.email);
        console.log("3. seguridad.usuarios WHERE correo =", authUser.email, ":");
        console.table(byEmail);

        if (byEmail && byEmail.length > 0) {
            const dbUser = byEmail[0];
            console.log("\n4. DB id_usuario:", dbUser.id_usuario);

            // Check prestadores
            const { data: pres } = await supabase.schema('gestion').from('prestadores')
                .select('*').eq('id_prestador', dbUser.id_usuario);
            console.log("5. gestion.prestadores WHERE id_prestador =", dbUser.id_usuario, ":");
            console.table(pres);

            // Check reservas
            const { data: res } = await supabase.schema('gestion').from('reservas')
                .select('*').eq('id_prestador', dbUser.id_usuario);
            console.log("6. gestion.reservas WHERE id_prestador =", dbUser.id_usuario, ":");
            console.table(res);

            // Show all existing prestadores
            const { data: allPres } = await supabase.schema('gestion').from('prestadores').select('*');
            console.log("\n7. ALL prestadores in DB:");
            console.table(allPres);
        }
    }
}

traceUser();
