-- 1. Otorgar permisos de uso en el esquema 'seguridad'
GRANT USAGE ON SCHEMA seguridad TO anon;
GRANT USAGE ON SCHEMA seguridad TO authenticated;
GRANT USAGE ON SCHEMA seguridad TO service_role;

-- 2. Otorgar permisos sobre la tabla 'usuarios'
GRANT ALL ON seguridad.usuarios TO service_role;
GRANT SELECT ON seguridad.usuarios TO authenticated;
GRANT SELECT ON seguridad.usuarios TO anon;

-- 3. Habilitar RLS
ALTER TABLE seguridad.usuarios ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICA 1: Usuarios pueden ver su propio perfil (Sin recursión)
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON seguridad.usuarios;
CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON seguridad.usuarios 
FOR SELECT 
TO authenticated 
USING (auth.uid() = auth_id);

-- 5. POLÍTICA 2: Admins pueden ver todo (Usando el JWT para evitar recursión)
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON seguridad.usuarios;
CREATE POLICY "Admins pueden ver todos los perfiles" 
ON seguridad.usuarios 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
);

-- 6. Permitir que fecha_nacimiento sea nulo para evitar errores en creación desde Admin
ALTER TABLE seguridad.usuarios ALTER COLUMN fecha_nacimiento DROP NOT NULL;

-- 7. Permisos para el esquema 'gestion'
GRANT USAGE ON SCHEMA gestion TO anon;
GRANT USAGE ON SCHEMA gestion TO authenticated;
GRANT USAGE ON SCHEMA gestion TO service_role;

-- 8. Permisos sobre la tabla 'clientes' en el esquema gestion
GRANT ALL ON gestion.clientes TO service_role;
GRANT SELECT, INSERT, UPDATE ON gestion.clientes TO authenticated;

-- 9. Habilitar RLS en 'clientes'
ALTER TABLE gestion.clientes ENABLE ROW LEVEL SECURITY;

-- 10. Política para que los usuarios gestionen su propio registro en 'clientes'
DROP POLICY IF EXISTS "Usuarios pueden gestionar su propio perfil de cliente" ON gestion.clientes;
CREATE POLICY "Usuarios pueden gestionar su propio perfil de cliente" 
ON gestion.clientes 
FOR ALL 
TO authenticated 
USING (auth.uid() = auth_id);

-- 11. Columnas adicionales para el flujo de trabajo del Prestador
ALTER TABLE gestion.reservas ADD COLUMN IF NOT EXISTS estado_reserva TEXT DEFAULT 'pendiente';
ALTER TABLE gestion.prestadores ADD COLUMN IF NOT EXISTS estado_disponibilidad TEXT DEFAULT 'disponible';

-- 12. Permisos específicos para que los Prestadores actualicen sus estados
GRANT UPDATE(estado_reserva) ON gestion.reservas TO authenticated;
GRANT UPDATE(estado_disponibilidad) ON gestion.prestadores TO authenticated;
