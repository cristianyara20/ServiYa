import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // 1. Si no hay código, fuera.
    if (!code) return NextResponse.redirect(`${origin}/auth/login`)

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
                set(name: string, value: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value, ...options }) } catch (error) { }
                },
                remove(name: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value: '', ...options }) } catch (error) { }
                },
            },
        }
    )

    // 2. Intentamos intercambiar el código por la sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // 3. VERIFICACIÓN CRÍTICA: ¿Tenemos sesión ahora mismo?
    const { data: { session } } = await supabase.auth.getSession()

    // Si no hay error O si ya tenemos una sesión (porque se validó rápido), entramos.
    if (!error || session) {
        return NextResponse.redirect(`${origin}/auth/actualizar-clave`)
    }

    // 4. Si falló todo, al login con el detalle para saber qué pasó
    console.error("Error de Auth:", error?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=token-invalido`)
}