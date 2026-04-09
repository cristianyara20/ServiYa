import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(request, response);

  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = request.nextUrl.pathname.startsWith("/dashboard/admin");

  // Si no hay sesión y trata de entrar al dashboard → redirige al login
  if (!session && isDashboard) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Protección del panel admin
  if (session && isAdminPage && session.user.email !== "pepitoperez132604@gmail.com") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si hay sesión y trata de entrar al login → redirige al dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};