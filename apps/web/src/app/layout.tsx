import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { cloakSSROnlySecret } from "ssr-only-secrets";
import { ToastProvider } from "@kikos/ui/components/toast";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: 'Kikos CRM',
  description:
    'Kikos CRM',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heads = await headers();
  const cookie = new Headers(heads).get("cookie");
  const encryptedCookie = await cloakSSROnlySecret(
    cookie ?? "",
    "SECRET_CLIENT_COOKIE_VAR"
  );

  return (
    <html lang="pt" suppressHydrationWarning className="scroll-smooth dark">
      <body className="antialiased">
        <TRPCReactProvider ssrOnlySecret={encryptedCookie}>
          <ToastProvider>{children}</ToastProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
