/**
 * Re-exporta desde services/auth para mantener compatibilidad.
 * La implementación real vive en la capa de Services.
 */
export { logoutAction } from "@/services/auth/auth.actions";