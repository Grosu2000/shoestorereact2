import React from 'react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProductGridProps {
  category?: string;
  brand?: string;
  limit?: number;
  search?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  category, 
  brand, 
  limit,
  search
}) => {
  const { data: products, isLoading, error } = useProducts({ 
    category, 
    brand, 
    search 
  });

  
  console.log('Products from hook:', products);
  console.log('Products type:', typeof products);
  console.log('Is array?', Array.isArray(products));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Помилка завантаження товарів: {error.message}
      </div>
    );
  }

  
  const productList = Array.isArray(products) ? products : [];
  const displayedProducts = limit ? productList.slice(0, limit) : productList;

  console.log('Product list to display:', displayedProducts);

  if (displayedProducts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Товари не знайдені
      </div>
    );
  }

  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {displayedProducts.map((product, index) => (
      <ProductCard 
        key={`${product.id}-${index}-${Math.random().toString(36).substr(2, 9)}`} 
        product={product} 
      />
    ))}
  </div>
);
};