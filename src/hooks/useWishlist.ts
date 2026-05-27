import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { wishlistApi } from '../services/wishlist.api';
import type { Product } from '../types/product';

interface WishlistResponse {
  success: boolean;
  data: Product[];
}

export const useWishlist = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const fetchWishlist = async () => {
    console.log('=== useWishlist fetchWishlist ===');
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.log('No token, returning empty');
      setItems([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await wishlistApi.get();
      console.log('Raw response from API:', response);
      
      let products: Product[] = [];
      
      // Перевіряємо різні варіанти відповіді
      if (response && Array.isArray(response)) {
        products = response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as WishlistResponse).data)) {
        products = (response as WishlistResponse).data;
      } else if (response && typeof response === 'object' && 'data' in response && 'data' in (response as any).data && Array.isArray((response as any).data.data)) {
        products = (response as any).data.data;
      }
      
      console.log('Extracted products:', products);
      setItems(products);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      await wishlistApi.add(productId);
      await fetchWishlist();
    } catch (error) {
      console.error('Error adding:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  return { items, loading, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist };
};