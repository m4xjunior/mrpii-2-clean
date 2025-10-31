import type { Metadata } from "next";
import React from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scada - Grupo KH",
  description: "Sistema de monitoramento industrial SCADA baseado no MRPII",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="icon"
          href="/images/logo-icon.png"
          type="image/png"
        />
        <link
          rel="icon"
          href="/images/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          href="/assets/plugins/vectormap/jquery-jvectormap-2.0.2.css"
          rel="stylesheet"
        />
        <link
          href="/assets/plugins/simplebar/css/simplebar.css"
          rel="stylesheet"
        />
        <link
          href="/assets/plugins/perfect-scrollbar/css/perfect-scrollbar.css"
          rel="stylesheet"
        />
        <link
          href="/assets/plugins/metismenu/css/metisMenu.min.css"
          rel="stylesheet"
        />
        <link href="/assets/css/pace.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&family=Roboto&display=swap"
        />
        <link rel="stylesheet" href="/assets/css/icons.css" />
        <link rel="stylesheet" href="/assets/css/app.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        {children}
        <Analytics />
        {/* Scripts removidos para resolver erro de hidratação - usar imports dinâmicos se necessário */}
      </body>
    </html>
  );
}
