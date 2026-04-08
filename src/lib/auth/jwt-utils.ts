/**
 * @file src/lib/auth/jwt-utils.ts
 * @description Utilidades para decodificar JWTs de Supabase sin librerías externas.
 */

export interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  phone: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  role: string;
  aal: string;
  amr: { method: string; timestamp: number }[];
  session_id: string;
}

/**
 * Decodifica el payload de un JWT (Token de Acceso) de forma manual.
 * @param token El token JWT en formato string.
 * @returns El payload decodificado o null si el token es inválido.
 */
export function decodeRawJwt(token: string): SupabaseJwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al decodificar JWT:", error);
    return null;
  }
}

/**
 * Extrae el access_token de la cookie de Supabase si se conoce el nombre completo.
 * En Next.js, usualmente se accede vía `request.cookies.get(name)`.
 */
export function extractTokenFromCookieValue(cookieValue: string): string | null {
  try {
    const session = JSON.parse(cookieValue);
    return session.access_token || null;
  } catch {
    return null;
  }
}
