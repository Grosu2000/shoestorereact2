import { useState } from 'react';
import { useCartStore } from '../stores/cart-store';

export const useCart = () => {
  const {
    cart,
    addItem: storeAddItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice
  } = useCartStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (product: any, size: string, color: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Імітація мережевого запиту
      await new Promise(resolve => setTimeout(resolve, 300));
      storeAddItem(product, size, color);
    } catch (err) {
      setError('Помилка додавання в корзину');
      console.error('Cart error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items: cart.items,
    total: cart.total,
    itemCount: cart.itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice,
    isEmpty: cart.items.length === 0,
    isLoading,
    error
  };
};