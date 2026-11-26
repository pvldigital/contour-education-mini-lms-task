import { createBrowserClient } from "@supabase/ssr";

import { browserCookieMethods } from "@/lib/supabase/browser-cookies";
import type { Database } from "@/lib/supabase/database.types";
import { sessionCookieOptions } from "@/lib/supabase/cookie-options";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: sessionCookieOptions,
      cookies: browserCookieMethods,
    },
  );
}
