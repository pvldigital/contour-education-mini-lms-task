import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

const appOrigin = new URL("https://app.local");

// Resolve first: backslash paths like "/\evil.com" become an external origin.
function safeNextPath(value: string | null): string {
  if (!value) {
    return "/";
  }

  try {
    const target = new URL(value, appOrigin);

    if (target.origin !== appOrigin.origin) {
      return "/";
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    } else {
      const params = new URLSearchParams({ error: error.message });
      redirect(`/auth/error?${params.toString()}`);
    }
  }

  const params = new URLSearchParams({
    error: "No token hash or type",
  });
  redirect(`/auth/error?${params.toString()}`);
}
