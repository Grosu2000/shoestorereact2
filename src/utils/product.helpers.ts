import type { Product, ProductSize } from '../types/product';

export const calculateDiscountPercentage = (product: Product): number => {
  if (!product.originalPrice) return 0;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
};

export const isProductAvailable = (product: Product): boolean => {
  return product.inStock && product.sizes.some(size => size.stock > 0);
};

export const getAvailableSizes = (product: Product): ProductSize[] => {
  return product.sizes.filter(size => size.stock > 0);
};

export const getTotalStock = (product: Product): number => {
  return product.sizes.reduce((total, size) => total + size.stock, 0);
};

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('uk-UA')} грн`;
};

export const getAverageRating = (reviews: any[]): number => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

export const sortProducts = (
  products: Product[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc' = 'asc'
): Product[] => {
  return [...products].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'rating':
        comparison = b.rating - a.rating;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'newest':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};