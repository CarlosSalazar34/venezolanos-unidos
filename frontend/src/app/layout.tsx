import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JotaiProvider } from "@/providers/JotaiProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Venezolanos Unidos - Ayuda Post-Sismo",
  description:
    "Directorio centralizado de recursos y asistencia para los afectados por el sismo en Venezuela.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="icon"
          href="/logo/logoVUBlack.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/logo/logoVU.png"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body
        className={`${inter.className} antialiased h-dvh w-full overflow-hidden`}
      >
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
