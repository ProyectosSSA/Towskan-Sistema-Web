"use client";

import { useEffect, useState } from "react";
import { productService, Product } from "@/services/products";
import { categoryService, Category } from "@/services/categories";
import { useCart } from "@/context/CartContext";
import { resolveProductImage, getProductEmoji } from "@/lib/productAssets";
import { Search, Plus, Check, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";

export default function MenuPage() {
  const { addItem, toggleCart, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar categorías y productos iniciales
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [catsRes, prodsRes] = await Promise.all([
          categoryService.getAll(),
          productService.getAll(),
        ]);

        if (catsRes.success && catsRes.data) {
          setCategories(catsRes.data);
        }
        if (prodsRes.success && prodsRes.data) {
          setProducts(prodsRes.data);
        } else if (prodsRes.error) {
          setErrorMsg(prodsRes.error);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Error al conectar con la base de datos.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtrado reactivo en cliente (y opción de recargar si se requiere)
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCatId === null || p.categoria_id === selectedCatId;
    const matchesSearch =
      !searchTerm.trim() ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const getCategoryEmoji = (nombre: string) => {
    const lower = nombre.toLowerCase();
    if (lower.includes("hamburguesa")) return "🍔";
    if (lower.includes("acompañamiento") || lower.includes("papa")) return "🍟";
    if (lower.includes("bebida") || lower.includes("malteada")) return "🥤";
    if (lower.includes("salsa") || lower.includes("dip")) return "🥫";
    return "🍽️";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 w-full">
      {/* Header del Menú */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-towskan-orange-50 border border-towskan-orange-200 text-towskan-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carta Digital Interactiva</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Menú Gourmet Towskan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-lg">
            Elige entre nuestras hamburguesas Angus artesanales, crujientes acompañamientos,
            bebidas heladas y salsas insignia.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o ingrediente..."
            className="w-full pl-11 pr-9 py-3 rounded-2xl border border-gray-200 bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 focus:border-transparent transition shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 p-1.5"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selectoras de Categorías (Fiel a mockups de -towskan.pdf) */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 no-scrollbar">
        <button
          onClick={() => setSelectedCatId(null)}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border shrink-0 ${
            selectedCatId === null
              ? "bg-towskan-orange-500 text-white border-towskan-orange-500 shadow-md shadow-orange-500/20"
              : "bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
          }`}
        >
          <span>🔥</span>
          <span>Todas ({products.length})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCatId === cat.id;
          const count = products.filter((p) => p.categoria_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border shrink-0 ${
                isSelected
                  ? "bg-towskan-orange-500 text-white border-towskan-orange-500 shadow-md shadow-orange-500/20"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
              }`}
            >
              <span>{getCategoryEmoji(cat.nombre_categoria)}</span>
              <span>{cat.nombre_categoria} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Mensaje de error si la API falla */}
      {errorMsg && (
        <div className="p-4 mb-8 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid de Productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-white border border-gray-100 p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-32 bg-gray-100 rounded-2xl" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-8 bg-gray-100 rounded w-1/3 pt-4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-gray-100 max-w-md mx-auto">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-base font-bold text-gray-800 mb-1">No se encontraron productos</h3>
          <p className="text-xs text-gray-500 mb-4">
            No hay platos que coincidan con &quot;{searchTerm}&quot; en la categoría seleccionada.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCatId(null);
            }}
            className="px-4 py-2 bg-towskan-orange-50 text-towskan-orange-600 text-xs font-bold rounded-xl"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const isAdded = addedId === product.id;
            const emoji = getProductEmoji(product.categoria_nombre || product.nombre || "");
            const imgSrc = resolveProductImage(product.imagen, product.nombre);

            return (
              <div
                key={product.id}
                className={`p-4 sm:p-6 rounded-3xl bg-white border transition flex flex-col justify-between group shadow-sm ${
                  product.disponible
                    ? "border-gray-100 hover:shadow-xl hover:border-orange-200"
                    : "border-gray-200 opacity-60 bg-gray-50/50"
                }`}
              >
                <div>
                  {/* Ilustración / Imagen del Producto */}
                  <div className="w-full h-40 sm:h-44 rounded-2xl bg-towskan-cream-50 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-105 transition relative">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={product.nombre}
                        className="w-full h-full object-cover transition duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="text-6xl flex items-center justify-center w-full h-full"
                      style={{ display: imgSrc ? "none" : "flex" }}
                    >
                      {emoji}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-towskan-orange-600 uppercase tracking-wider truncate">
                      {product.categoria_nombre || "Especialidad"}
                    </span>
                    {product.disponible ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        Disponible
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">
                        Agotado
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-gray-900 mb-1.5 leading-snug">
                    {product.nombre}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                    {product.descripcion || "Receta artesanal exclusiva con ingredientes frescos de la más alta calidad."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      Precio
                    </span>
                    <span className="text-base font-black text-gray-900">
                      ${product.precio.toLocaleString("es-CO")} <span className="text-xs text-gray-500 font-semibold">COP</span>
                    </span>
                  </div>

                  <button
                    disabled={!product.disponible}
                    onClick={() => handleAddToCart(product)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:cursor-not-allowed ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : product.disponible
                        ? "bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white shadow-orange-500/20"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Agregado!</span>
                      </>
                    ) : product.disponible ? (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pedir</span>
                      </>
                    ) : (
                      <span>No disponible</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button en Mobile si hay productos */}
      {totalItems > 0 && (
        <div className="fixed bottom-5 right-4 sm:right-6 md:hidden z-30">
          <button
            onClick={toggleCart}
            className="px-5 py-3.5 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-black text-xs rounded-full shadow-2xl flex items-center gap-2.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Orden ({totalItems})</span>
          </button>
        </div>
      )}
    </div>
  );
}

