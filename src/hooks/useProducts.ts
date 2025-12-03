import { useProductStore } from '../stores/product-store';
import { mockProducts } from '../utils/constants';

export const useProducts = () => {
  const store = useProductStore();

  const loadProducts = () => {
    store.fetchProducts();
  };

  const getCategories = () => {
    return ['Всі', ...new Set(mockProducts.map(p => p.category))];
  };

  const getBrands = () => {
    return ['Всі', ...new Set(mockProducts.map(p => p.brand))];
  };

  return {
    products: store.products,
    filteredProducts: store.filteredProducts,
    isLoading: store.isLoading,
    error: store.error,
    loadProducts,
    setCategory: store.setCategory,
    setBrand: store.setBrand,
    setPriceRange: store.setPriceRange,
    getCategories,
    getBrands,
    getProductById: store.getProductById
  };
};