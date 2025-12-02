import { useCartStore } from '../stores/cart-store';

export const useCart = () => {
  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice
  } = useCartStore();

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
    isEmpty: cart.items.length === 0
  };
};