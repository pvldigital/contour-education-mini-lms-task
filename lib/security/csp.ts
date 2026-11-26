function supabaseConnectSources() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const websocketProtocol = url.protocol === "https:" ? "wss:" : "ws:";

    return ` ${url.origin} ${websocketProtocol}//${url.host}`;
  } catch {
    return "";
  }
}

export function createContentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${supabaseConnectSources()}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
