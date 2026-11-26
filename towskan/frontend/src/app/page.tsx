"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { productService, Product } from "@/services/products";
import { resolveProductImage, getProductEmoji } from "@/lib/productAssets";
import { ArrowRight, Flame, Clock, ShieldCheck, Sparkles, Plus, Check } from "lucide-react";

export default function HomePage() {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await productService.getAll({ disponible: true });
        if (res.success && res.data) {
          // Tomar los primeros 3 productos de autor
          setFeaturedProducts(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error al cargar productos destacados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleQuickAdd = (product: Product) => {
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section alineado fielmente a los mockups de -towskan.pdf */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:py-24 bg-gradient-to-b from-orange-50/50 via-white to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Lado izquierdo: Textos y CTAs */}
          <div className="space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-towskan-orange-50 border border-towskan-orange-200 text-towskan-orange-600 text-[11px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-towskan-orange-500 shrink-0" />
              <span>Sabor Express & Calidad Gourmet</span>
            </div>

            <h1 className="text-3xl min-[400px]:text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
              El Sabor más Rápido de <br className="hidden min-[380px]:inline" />
              <span className="text-towskan-orange-500 underline decoration-towskan-orange-200 decoration-wavy decoration-4">
                la Ciudad
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed mx-auto lg:mx-0">
              Vive la experiencia gourmet a la velocidad de la comida rápida. Carne 100% Angus,
              pan brioche recién horneado y salsas secretas artesanales entregadas a domicilio o servidas en mesa.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/menu"
                className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Explorar Menú Completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pedidos"
                className="w-full sm:w-auto text-center px-6 sm:px-7 py-3.5 sm:py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200 rounded-2xl shadow-sm transition"
              >
                Rastrear mi Pedido
              </Link>
            </div>

            {/* Badges de garantía */}
            <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-100 text-center lg:text-left">
              <div>
                <p className="text-lg sm:text-xl font-black text-gray-900">30 min</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">Entrega promedio</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-black text-towskan-orange-500">100%</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">Carne Angus certificada</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-black text-emerald-600">4.9 ★</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">Satisfacción en Valledupar</p>
              </div>
            </div>
          </div>

          {/* Lado derecho: Tarjeta de Hamburguesa Insignia */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md bg-gradient-to-tr from-towskan-orange-500 to-orange-400 rounded-3xl p-5 sm:p-8 text-white shadow-2xl shadow-orange-500/30 overflow-hidden transform hover:scale-[1.01] transition">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase">
                  ⭐ Favorita de la Casa
                </span>
                <span className="text-2xl">🍔</span>
              </div>

              {/* Imagen Destacada Hero */}
              <div className="w-full h-40 sm:h-44 rounded-2xl bg-white/10 overflow-hidden mb-4 relative flex items-center justify-center border border-white/20">
                <img
                  src="/images/menu/towskan-clasica.jpg"
                  alt="Towskan Master Clásica"
                  className="w-full h-full object-cover transition duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <span className="text-6xl hidden items-center justify-center w-full h-full">🍔</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black mb-2">Towskan Master Clásica</h3>
              <p className="text-white/80 text-xs mb-5 sm:mb-6 leading-relaxed">
                200g de carne Angus, queso cheddar fundido, tocineta crujiente, vegetales frescos y la salsa secreta de autor.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/20">
                <div>
                  <span className="text-[11px] text-white/70 uppercase tracking-wider block">Precio Especial</span>
                  <span className="text-xl sm:text-2xl font-black">$24.900 COP</span>
                </div>
                <Link
                  href="/menu"
                  className="px-5 py-2.5 bg-white text-towskan-orange-600 hover:bg-orange-50 font-black text-xs rounded-xl shadow-md transition"
                >
                  Pedir Ahora
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Propuesta de Valor y Características */}
      <section className="py-12 sm:py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              ¿Por qué elegir Towskan?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Fusionamos la agilidad del fast-food con técnicas culinarias de alta cocina.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <div className="p-5 sm:p-6 rounded-2xl bg-towskan-cream-50 border border-gray-100 flex flex-col items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-xl bg-towskan-orange-50 text-towskan-orange-500 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Ingredientes Premium</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Carnes seleccionadas sin conservantes, quesos madurados y pan brioche horneado artesanalmente cada mañana.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-towskan-cream-50 border border-gray-100 flex flex-col items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-xl bg-towskan-orange-50 text-towskan-orange-500 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">3 Modalidades Flexibles</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pide directo a tu puerta con rastreo en vivo, recoge en punto de venta o disfruta en nuestras mesas cómodamente.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-towskan-cream-50 border border-gray-100 flex flex-col items-start gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-towskan-orange-50 text-towskan-orange-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Transacciones Transparentes</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cálculo exacto de impuestos (8% consumo), desglose de envíos y pagos seguros con Nequi, Daviplata o Efectivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destacados del Menú Gourmet */}
      <section className="py-12 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-towskan-orange-500">
              Catálogo de Especialidades
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Favoritas de la Semana
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs font-bold text-towskan-orange-600 hover:text-towskan-orange-700 flex items-center gap-1 group"
          >
            <span>Ver menú completo ({featuredProducts.length > 0 ? "13 recetas" : "cargando..."})</span>
            <ArrowRight className="w-4 h-4 transition transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featuredProducts.map((prod) => {
              const imgSrc = resolveProductImage(prod.imagen, prod.nombre);
              return (
              <div
                key={prod.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Ilustración / Imagen del Producto */}
                  <div className="w-full h-40 sm:h-44 rounded-2xl bg-towskan-cream-50 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-105 transition relative">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={prod.nombre}
                        className="w-full h-full object-cover transition duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="text-5xl flex items-center justify-center w-full h-full"
                      style={{ display: imgSrc ? "none" : "flex" }}
                    >
                      {getProductEmoji(prod.nombre)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-towskan-orange-600 uppercase tracking-wider">
                      {prod.categoria_nombre || "Gourmet"}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      Disponible
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-2">{prod.nombre}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {prod.descripcion}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <span className="text-base font-black text-gray-900">
                    ${(prod.precio ?? 0).toLocaleString("es-CO")} COP
                  </span>
                  <button
                    onClick={() => handleQuickAdd(prod)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      addedId === prod.id
                        ? "bg-emerald-600 text-white"
                        : "bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white"
                    }`}
                  >
                    {addedId === prod.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Agregado!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Banner de Estado de Fases */}
      <section className="py-10 sm:py-12 bg-towskan-cream-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] sm:text-xs font-bold max-w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>Fase 3 Activa: Menú Interactivo, Carrito Reactivo y Pasarela de Checkout</span>
          </div>
          <h3 className="text-xl font-black text-gray-900">
            Arquitectura Real Conectada a Base de Datos
          </h3>
          <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
            Todos los productos, pedidos y pagos que realices se procesan directamente contra el backend Flask
            y la base de datos relacional conforme a las normas ISO/IEC 25010 y 12207.
          </p>
        </div>
      </section>
    </div>
  );
}
