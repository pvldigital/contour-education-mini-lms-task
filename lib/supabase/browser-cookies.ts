import type { CookieOptions } from "@supabase/ssr";

import {
  SESSION_COOKIE_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/supabase/cookie-options";

// Browser auth writes cookies directly; enforce the same policy as the server.

type BrowserCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function readCookies() {
  if (typeof document === "undefined") {
    return [];
  }

  return document.cookie.split("; ").flatMap((part) => {
    const separator = part.indexOf("=");

    if (separator < 1) {
      return [];
    }

    return [
      {
        name: part.slice(0, separator),
        value: part.slice(separator + 1),
      },
    ];
  });
}

function writeCookie({ name, value, options }: BrowserCookie) {
  const maxAge =
    options.maxAge === 0 ? 0 : SESSION_COOKIE_MAX_AGE;
  const attributes = [
    `Path=${options.path ?? sessionCookieOptions.path}`,
    `Max-Age=${maxAge}`,
    `SameSite=${options.sameSite ?? sessionCookieOptions.sameSite}`,
  ];

  if (options.secure ?? sessionCookieOptions.secure) {
    attributes.push("Secure");
  }

  if (options.domain) {
    attributes.push(`Domain=${options.domain}`);
  }

  document.cookie = `${name}=${value}; ${attributes.join("; ")}`;
}

export const browserCookieMethods = {
  getAll: readCookies,
  setAll(cookies: BrowserCookie[]) {
    if (typeof document === "undefined") {
      return;
    }

    cookies.forEach(writeCookie);
  },
};
