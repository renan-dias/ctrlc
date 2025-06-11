import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ctrlC - Editor & Diagramas",
  description: "Editor de código moderno com área de desenho para diagramas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        {children}
      </body>
    </html>
  );
}
