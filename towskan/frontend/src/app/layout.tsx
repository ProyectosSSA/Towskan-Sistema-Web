import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Towskan | Menú Gourmet y Pedidos Rápidos",
  description: "Plataforma web de pedidos y menú interactivo de Towskan - ADSO SENA CBC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-towskan-cream-50 text-towskan-dark-900 antialiased flex flex-col justify-between">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
