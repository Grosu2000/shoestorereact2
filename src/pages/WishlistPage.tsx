import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

export const WishlistPage: React.FC = () => {
  const { items, loading } = useWishlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-3xl mx-auto px-4 text-center py-16">
          <div className="text-6xl mb-4 opacity-50">❤️</div>
          <h1 className="text-2xl font-bold text-text mb-4">Список бажаних порожній</h1>
          <p className="text-text/60 mb-8">Додавайте товари, щоб повернутися до них пізніше.</p>
          <Link to="/products">
            <Button size="lg">Перейти до товарів</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-text mb-6">Список бажаних ({items.length})</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};