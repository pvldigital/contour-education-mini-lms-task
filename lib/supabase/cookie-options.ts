import type { CookieOptions } from "@supabase/ssr";

export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const isHttps = supabaseUrl?.startsWith("https://") ?? false;

export const sessionCookieOptions: CookieOptions = {
  path: "/",
  sameSite: "lax",
  secure: isHttps,
  maxAge: SESSION_COOKIE_MAX_AGE,
  // Browser-side Supabase auth must read the session; CSP limits XSS impact.
  httpOnly: false,
};
