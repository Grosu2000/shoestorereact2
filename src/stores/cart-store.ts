import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem, Product } from '../types/product';

interface CartStore {
  cart: Cart;
addItem: (product: Product, size: string, color: string, quantity?: number) => void
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        total: 0,
        itemCount: 0,
      },

      addItem: (product, size, color) => {
        set((state) => {
          const existingItemIndex = state.cart.items.findIndex(
            item => 
              item.product.id === product.id && 
              item.selectedSize === size && 
              item.selectedColor === color
          );

          let newItems: CartItem[];

          if (existingItemIndex >= 0) {
            newItems = state.cart.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            const newItem: CartItem = {
              product,
              quantity: 1,
              selectedSize: size,
              selectedColor: color,
            };
            newItems = [...state.cart.items, newItem];
          }

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

          return {
            cart: {
              items: newItems,
              itemCount,
              total,
            },
          };
        });
      },

      removeItem: (productId, size, color) => {
        set((state) => {
          const newItems = state.cart.items.filter(
            item => 
              !(item.product.id === productId && 
                item.selectedSize === size && 
                item.selectedColor === color)
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

          return {
            cart: {
              items: newItems,
              itemCount,
              total,
            },
          };
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, size, color);
          return;
        }

        set((state) => {
          const newItems = state.cart.items.map(item =>
            item.product.id === productId && 
            item.selectedSize === size && 
            item.selectedColor === color
              ? { ...item, quantity }
              : item
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

          return {
            cart: {
              items: newItems,
              itemCount,
              total,
            },
          };
        });
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            total: 0,
            itemCount: 0,
          },
        });
      },

      getItemCount: () => {
        return get().cart.itemCount;
      },

      getTotalPrice: () => {
        return get().cart.total;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);