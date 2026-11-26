import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Towskan | Menú Gourmet y Pedidos Rápidos",
  description: "Plataforma web de pedidos y menú interactivo de Towskan - ADSO SENA CBC",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen min-h-[100dvh] bg-towskan-cream-50 text-towskan-dark-900 antialiased flex flex-col justify-between">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1 w-full min-w-0">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
