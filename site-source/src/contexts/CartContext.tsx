import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { shopProducts, ShopProduct } from "@/data/products";

type CartLine = { id: string; qty: number };

type CartContextType = {
  lines: (CartLine & { product: ShopProduct })[];
  count: number;
  total: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "aidlin-cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage not available - cart just won't persist */
    }
  }, [items]);

  const value = useMemo<CartContextType>(() => {
    const lines = items
      .map((l) => ({ ...l, product: shopProducts.find((p) => p.id === l.id) }))
      .filter((l): l is CartLine & { product: ShopProduct } => !!l.product);

    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((sum, l) => sum + l.qty * l.product.price, 0),
      isOpen,
      setOpen,
      add: (id) =>
        setItems((cur) => {
          const unique = shopProducts.find((p) => p.id === id)?.oneOfAKind;
          if (cur.some((l) => l.id === id)) {
            return unique ? cur : cur.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
          }
          return [...cur, { id, qty: 1 }];
        }),
      setQty: (id, qty) =>
        setItems((cur) => {
          const unique = shopProducts.find((p) => p.id === id)?.oneOfAKind;
          const q = unique ? Math.min(qty, 1) : qty;
          return q <= 0 ? cur.filter((l) => l.id !== id) : cur.map((l) => (l.id === id ? { ...l, qty: q } : l));
        }),
      remove: (id) => setItems((cur) => cur.filter((l) => l.id !== id)),
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
