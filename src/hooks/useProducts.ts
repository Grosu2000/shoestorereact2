import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Product } from '../types/product';

export const useProducts = (params?: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.category) queryParams.append('category', params.category);
      if (params?.brand) queryParams.append('brand', params.brand);
      if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/products?${queryString}` : '/products';
      
      // API повертає просто масив товарів: Product[]
      const products = await api.get<Product[]>(url);
      
      console.log('API products:', products); // Додайте цей лог
      
      return products; // Повертаємо просто масив
    },
    staleTime: 1000 * 60 * 5,
  });
};