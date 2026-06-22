import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testInsert() {
    console.log("Testing insert into seguridad.usuarios...");
    const { data, error } = await supabase
        .schema('seguridad')
        .from('usuarios')
        .insert({
            auth_id: '00000000-0000-0000-0000-000000000000',
            correo: 'test_creation_error@example.com',
            nombre: 'Test',
            apellido: 'Error',
            rol: 'usuario'
        });
        
    if (error) {
        console.error("INSERT ERROR:", error);
    } else {
        console.log("INSERT SUCCESS:", data);
        // Clean up
        await supabase.schema('seguridad').from('usuarios').delete().eq('correo', 'test_creation_error@example.com');
    }
}
testInsert();
