import type { Metadata } from "next";
import Script from "next/script";
import React from "react";
import "./globals.css";
import { ThemeProvider } from "../../hooks/useTheme";

export const metadata: Metadata = {
  title: "SCADA - Sistema MRPII",
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
          href="/assets/images/favicon-32x32.png"
          type="image/png"
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
        <ThemeProvider>{children}</ThemeProvider>
        {/* Removido pace.min.js para resolver erro de hidratação */}
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="afterInteractive"
        />
        <Script src="/assets/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/simplebar/js/simplebar.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/metismenu/js/metisMenu.min.js" strategy="lazyOnload" />
        <Script
          src="/assets/plugins/perfect-scrollbar/js/perfect-scrollbar.js"
          strategy="lazyOnload"
        />
        <Script
          src="/assets/plugins/vectormap/jquery-jvectormap-2.0.2.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="/assets/plugins/vectormap/jquery-jvectormap-world-mill-en.js"
          strategy="lazyOnload"
        />
        <Script
          src="/assets/plugins/vectormap/jquery-jvectormap-in-mill.js"
          strategy="lazyOnload"
        />
        <Script
          src="/assets/plugins/vectormap/jquery-jvectormap-us-aea-en.js"
          strategy="lazyOnload"
        />
        <Script
          src="/assets/plugins/vectormap/jquery-jvectormap-uk-mill-en.js"
          strategy="lazyOnload"
        />
        <Script
          src="/assets/plugins/vectormap/jquery-jvectormap-au-mill.js"
          strategy="lazyOnload"
        />
        <Script
          src="/assets/plugins/apexcharts-bundle/js/apexcharts.min.js"
          strategy="lazyOnload"
        />
        <Script src="/assets/js/index2.js" strategy="lazyOnload" />
        <Script src="/assets/js/app.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
