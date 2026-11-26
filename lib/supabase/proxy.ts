import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createContentSecurityPolicy } from "@/lib/security/csp";
import type { Database } from "@/lib/supabase/database.types";
import {
  SESSION_COOKIE_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/supabase/cookie-options";
import { hasEnvVars } from "../utils";

function syncCookieHeader(request: NextRequest, headers: Headers) {
  const cookie = request.cookies
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  if (cookie) {
    headers.set("cookie", cookie);
  } else {
    headers.delete("cookie");
  }
}

export async function updateSession(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = createContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
  supabaseResponse.headers.set("Content-Security-Policy", csp);

  // If the env vars are not set, skip proxy check. The page guards and
  // database RLS still apply; configured environments fail closed at setup.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: sessionCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          syncCookieHeader(request, requestHeaders);
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          supabaseResponse.headers.set("Content-Security-Policy", csp);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge:
                options.maxAge === 0 ? 0 : SESSION_COOKIE_MAX_AGE,
            }),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/" || pathname.startsWith("/auth");

  if (!user && pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/sign-up")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
