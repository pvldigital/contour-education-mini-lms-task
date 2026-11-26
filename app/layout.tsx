import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Nonce-based CSP headers are applied per request by the proxy.
export const dynamic = "force-dynamic";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Mini LMS",
  description: "Book and manage consultations with your education team.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          scriptProps={{ nonce }}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
