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

  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const devConnect = isDev
    ? " ws://localhost:* ws://127.0.0.1:*"
    : "";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${supabaseConnectSources()}${devConnect}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
