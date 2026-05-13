import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/product';

interface CompareStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  isInCompare: (productId: string) => boolean;
  getItemsCount: () => number;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        if (items.length >= 4) {
          return;
        }
        if (items.some(item => item.id === product.id)) {
          return;
        }
        set({ items: [...items, product] });
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== productId) });
      },

      clearAll: () => {
        set({ items: [] });
      },

      isInCompare: (productId) => {
        return get().items.some(item => item.id === productId);
      },

      getItemsCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'compare-storage',
    }
  )
);