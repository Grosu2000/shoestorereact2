import React from 'react';
import type { Product } from '../../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products?: Product[];
  limit?: number;
  category?: string;
  brand?: string;
  search?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, limit }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-accent">
        <div className="text-6xl mb-4">👟</div>
        <p className="text-text/60 text-lg">Товари не знайдені</p>
        <p className="text-text/40 text-sm mt-2">Спробуйте змінити фільтри</p>
      </div>
    );
  }

  const displayProducts = limit ? products.slice(0, limit) : products;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {displayProducts.map((product, index) => (
        <ProductCard
          key={`${product.id}-${index}`}
          product={product}
        />
      ))}
    </div>
  );
};