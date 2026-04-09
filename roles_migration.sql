-- 1. Añadimos la columna 'rol' a la tabla 'usuarios' dentro del esquema 'seguridad'
ALTER TABLE seguridad.usuarios
ADD COLUMN IF NOT EXISTS rol VARCHAR(50) DEFAULT 'usuario';

-- Asegurarnos que el valor de 'rol' sea uno de los permitidos
ALTER TABLE seguridad.usuarios
DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE seguridad.usuarios
ADD CONSTRAINT usuarios_rol_check 
CHECK (rol IN ('usuario', 'prestador', 'admin'));

-- 2. Creamos o reemplazamos la función del Trigger que se encarga de guardar
-- al usuario cuando se registra de forma exitosa en Supabase Auth.
CREATE OR REPLACE FUNCTION seguridad.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO seguridad.usuarios (auth_id, correo, nombre, apellido, fecha_nacimiento, rol)
  VALUES (
    NEW.id,
    NEW.email,
    -- Obtenemos los valores desde el raw_user_meta_data que se envía en el momento del signUp
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellido',
    (NULLIF(NEW.raw_user_meta_data->>'fecha_nacimiento', ''))::DATE,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'usuario') -- Por defecto 'usuario' si no viene nada
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asignamos o volvemos a generar el Trigger sobre la tabla secreta auth.users de Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE seguridad.handle_new_user();
