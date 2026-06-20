import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, requireSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

const PROTECTED_PATHS = ["/dashboard", "/lancamentos", "/extrato", "/gastos", "/comprovantes"];

export async function updateSession(request: NextRequest) {
  const isProtectedRoute = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!isSupabaseConfigured()) {
    if (!isProtectedRoute) {
      return NextResponse.next({ request });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const config = requireSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
