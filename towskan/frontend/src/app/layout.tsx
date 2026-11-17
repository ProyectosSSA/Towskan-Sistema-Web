import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Towskan | Menú Gourmet y Pedidos Rápidos",
  description: "Plataforma web de pedidos y menú interactivo de Towskan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-towskan-cream-50 text-towskan-dark-900 antialiased">
        {children}
      </body>
    </html>
  );
}
