import { useQuery } from '@tanstack/react-query';
import { useProductStore } from '../stores/product-store';
import { mockProducts } from '../utils/constants';

export const useProducts = () => {
  const store = useProductStore();

  // Використання React Query для отримання товарів
  const { data: products = mockProducts, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Імітація API запиту
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProducts;
    },
    staleTime: 1000 * 60 * 5, // 5 хвилин
  });

  const getCategories = () => {
    return ['Всі', ...new Set(products.map(p => p.category))];
  };

  const getBrands = () => {
    return ['Всі', ...new Set(products.map(p => p.brand))];
  };

  return {
    products,
    filteredProducts: store.filteredProducts,
    isLoading,
    error: error?.message || null,
    setCategory: store.setCategory,
    setBrand: store.setBrand,
    setPriceRange: store.setPriceRange,
    getCategories,
    getBrands,
    getProductById: store.getProductById
  };
};