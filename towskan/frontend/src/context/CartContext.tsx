"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/services/products";
import { DeliveryType, orderService, QuoteResult } from "@/services/orders";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  impuestos: number;
  envio: number;
  total: number;
  tipoEntrega: DeliveryType;
  numeroMesa: string;
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  setTipoEntrega: (tipo: DeliveryType) => void;
  setNumeroMesa: (mesa: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TARIFA_DOMICILIO = 5000;
const TASA_IMPUESTO = 0.08;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState<DeliveryType>("domicilio");
  const [numeroMesa, setNumeroMesa] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar estado inicial desde localStorage al montar en cliente
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("towskan_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedTipo = localStorage.getItem("towskan_tipo_entrega") as DeliveryType;
      if (storedTipo) {
        setTipoEntrega(storedTipo);
      }
      const storedMesa = localStorage.getItem("towskan_numero_mesa");
      if (storedMesa) {
        setNumeroMesa(storedMesa);
      }
    } catch {
      // Ignorar errores de deserialización
    }
  }, []);

  // Persistir cambios en localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("towskan_cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("towskan_tipo_entrega", tipoEntrega);
    }
  }, [tipoEntrega, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("towskan_numero_mesa", numeroMesa);
    }
  }, [numeroMesa, mounted]);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.product.id === product.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quantity: updated[index].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Cálculos reactivos exactos
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.precio * item.quantity, 0);
  const impuestos = Math.round(subtotal * TASA_IMPUESTO);
  const envio = tipoEntrega === "domicilio" && items.length > 0 ? TARIFA_DOMICILIO : 0;
  const total = subtotal + impuestos + envio;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        impuestos,
        envio,
        total,
        tipoEntrega,
        numeroMesa,
        isCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setTipoEntrega,
        setNumeroMesa,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un CartProvider");
  }
  return context;
}

