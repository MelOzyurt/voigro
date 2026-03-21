export interface ParsedProduct {
  name: string;
  description?: string;
  price?: number;
  category: string;
  selected: boolean;
}

export interface ParsedCategory {
  name: string;
  products: { name: string; description?: string; price?: number }[];
}

export function flattenParsedCategories(categories: ParsedCategory[]): ParsedProduct[] {
  const items: ParsedProduct[] = [];
  for (const cat of categories) {
    for (const p of cat.products) {
      items.push({
        name: p.name,
        description: p.description,
        price: p.price,
        category: cat.name,
        selected: true,
      });
    }
  }
  return items;
}

export function cleanPrice(text: string): number | undefined {
  const cleaned = text.replace(/[£$€¥₹,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

export function deduplicateProducts(items: ParsedProduct[]): ParsedProduct[] {
  const seen = new Map<string, ParsedProduct>();
  for (const item of items) {
    const key = `${item.name.toLowerCase().trim()}|${item.category.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
