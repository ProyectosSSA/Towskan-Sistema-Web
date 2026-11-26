export function resolveProductImage(img?: string | null, name?: string | null): string | null {
  if (img && img.trim()) return img;
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes("clasica") || n.includes("clásica") || n.includes("master")) return "/images/menu/towskan-clasica.jpg";
  if (n.includes("doble queso") || n.includes("bacon")) return "/images/menu/doble-queso-bacon.jpg";
  if (n.includes("smoked") || n.includes("bbq")) return "/images/menu/smoked-bbq.jpg";
  if (n.includes("chicken") || n.includes("volcano")) return "/images/menu/chicken-crispy.jpg";
  if (n.includes("papas rusticas") || n.includes("rústicas") || n.includes("papas")) return "/images/menu/papas-rusticas.jpg";
  if (n.includes("salchipapa")) return "/images/menu/salchipapas.jpg";
  if (n.includes("aros")) return "/images/menu/aros-cebolla.jpg";
  if (n.includes("oreo")) return "/images/menu/malteada-oreo.jpg";
  if (n.includes("arequipe")) return "/images/menu/malteada-arequipe.jpg";
  if (n.includes("limonada") || n.includes("coco")) return "/images/menu/limonada-coco.jpg";
  if (n.includes("gaseosa") || n.includes("coca")) return "/images/menu/gaseosa.jpg";
  if (n.includes("salsa towskan") || n.includes("secreta")) return "/images/menu/salsa-towskan.jpg";
  if (n.includes("cheddar")) return "/images/menu/cheddar-dip.jpg";
  return null;
}

export function getProductEmoji(nombre: string): string {
  const lower = nombre.toLowerCase();
  if (
    lower.includes("hamburguesa") ||
    lower.includes("angus") ||
    lower.includes("bacon") ||
    lower.includes("bbq") ||
    lower.includes("chicken") ||
    lower.includes("clasica") ||
    lower.includes("clásica")
  ) {
    return "🍔";
  }
  if (
    lower.includes("acompañamiento") ||
    lower.includes("papa") ||
    lower.includes("salchipapa") ||
    lower.includes("aros")
  ) {
    return "🍟";
  }
  if (
    lower.includes("bebida") ||
    lower.includes("malteada") ||
    lower.includes("limonada") ||
    lower.includes("gaseosa")
  ) {
    return "🥤";
  }
  if (lower.includes("salsa") || lower.includes("dip") || lower.includes("cheddar")) {
    return "🥫";
  }
  return "🍽️";
}
