"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { resolveProductImage, getProductEmoji } from "@/lib/productAssets";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Utensils, Bike, ShoppingCart } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    impuestos,
    envio,
    total,
    tipoEntrega,
    setTipoEntrega,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      {/* Backdrop oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
          {/* Header del carrito */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-towskan-cream-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-towskan-orange-500 text-white flex items-center justify-center font-bold shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">Tu Pedido</h2>
                <p className="text-xs text-gray-500">{totalItems} {totalItems === 1 ? "producto" : "productos"}</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modalidad de entrega */}
          {items.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Modalidad de entrega
              </span>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setTipoEntrega("domicilio")}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition border ${
                    tipoEntrega === "domicilio"
                      ? "bg-towskan-orange-500 text-white border-towskan-orange-500 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Domicilio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoEntrega("para llevar")}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition border ${
                    tipoEntrega === "para llevar"
                      ? "bg-towskan-orange-500 text-white border-towskan-orange-500 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Llevar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoEntrega("en mesa")}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition border ${
                    tipoEntrega === "en mesa"
                      ? "bg-towskan-orange-500 text-white border-towskan-orange-500 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>En Mesa</span>
                </button>
              </div>
            </div>
          )}

          {/* Contenido: Lista de productos */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-8">
                <div className="w-16 h-16 rounded-full bg-towskan-orange-50 text-towskan-orange-500 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-xs">
                  Agrega tus hamburguesas gourmet, bebidas o acompañamientos favoritos para comenzar tu orden.
                </p>
                <Link
                  href="/menu"
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Ver el Menú
                </Link>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const imgSrc = resolveProductImage(product.imagen, product.nombre);
                return (
                <div
                  key={product.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-wrap min-[380px]:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 hover:border-orange-200 transition"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-towskan-orange-600 flex items-center justify-center font-black text-lg shrink-0 overflow-hidden relative">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="w-full h-full flex items-center justify-center"
                        style={{ display: imgSrc ? "none" : "flex" }}
                      >
                        {getProductEmoji(product.nombre)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {product.nombre}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        ${product.precio.toLocaleString("es-CO")} COP c/u
                      </p>
                      <span className="text-xs font-black text-towskan-orange-600 block mt-0.5">
                        ${(product.precio * quantity).toLocaleString("es-CO")} COP
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1.5 hover:bg-gray-200 text-gray-600 transition min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title="Disminuir"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800 min-w-[22px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1.5 hover:bg-gray-200 text-gray-600 transition min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title="Aumentar"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition min-w-[30px] min-h-[30px] flex items-center justify-center"
                      title="Eliminar del pedido"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>

          {/* Footer de totales y Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6 border-t border-gray-100 bg-towskan-cream-50 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-800">
                    ${subtotal.toLocaleString("es-CO")} COP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Impoconsumo (8%):</span>
                  <span className="font-semibold text-gray-800">
                    ${impuestos.toLocaleString("es-CO")} COP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío ({tipoEntrega}):</span>
                  <span className="font-semibold text-gray-800">
                    {envio === 0 ? "Gratis" : `$${envio.toLocaleString("es-CO")} COP`}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                  <span>Total a Pagar:</span>
                  <span className="text-towskan-orange-600">
                    ${total.toLocaleString("es-CO")} COP
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 px-4 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <span>Confirmar y Pagar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

