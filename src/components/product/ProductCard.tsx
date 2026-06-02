import React from "react";
import type { Product } from "../../types/product";
import { useCartStore } from "../../stores/cart-store";
import { useWishlist } from "../../hooks/useWishlist";
import { useAuthStore } from "../../stores/auth-store";
import { useToast } from "../../contexts/ToastContext";
import { Link } from "react-router-dom";
import { getFirstImage } from "../../utils/imageHelpers";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const images = product.images?.length ? product.images : ["/images/placeholder.jpg"];
  
  // Використовуємо sizeColorMatrix для підрахунку загальної кількості
  const sizeColorMatrix = product.sizeColorMatrix || {};
  
  let totalStock = 0;
  Object.values(sizeColorMatrix).forEach((colorMap: any) => {
    Object.values(colorMap).forEach((stock: any) => {
      totalStock += stock || 0;
    });
  });
  
  const inStock = product.inStock !== undefined ? product.inStock : totalStock > 0;
  
  // Отримуємо перший доступний розмір та колір для кнопки (якщо є)
  const firstSize = Object.keys(sizeColorMatrix)[0] || "";
  const firstColor = firstSize ? Object.keys(sizeColorMatrix[firstSize] || {})[0] : "";
  
  const finalSize = firstSize;
  const finalColor = firstColor;

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isNewProduct = product.createdAt
    ? new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    : false;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!finalSize || !finalColor) {
      showToast("Товар тимчасово недоступний", "error");
      return;
    }
    addItem(product, finalSize, finalColor, 1);
    showToast(`Товар додано до кошика!`, "success");
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Увійдіть, щоб додати до списку бажаних", "error");
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(product.id);
      showToast("Товар видалено зі списку бажаних", "info");
    } else {
      await addToWishlist(product.id);
      showToast("Товар додано до списку бажаних", "success");
    }
  };

  // Показуємо перші 3 розміри для відображення
  const displaySizes = Object.keys(sizeColorMatrix).slice(0, 3);

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* БЕЙДЖИ */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}
          {isNewProduct && discountPercentage === 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              NEW
            </span>
          )}
        </div>

        {/* КНОПКА WISHLIST */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-all duration-200"
        >
          <svg className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'fill-none text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* ЗОБРАЖЕННЯ */}
        <div className="relative overflow-hidden bg-accent/30">
          <img
            src={getFirstImage(images)}
            alt={product.name}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-text px-3 py-1 rounded-full text-sm font-medium">Немає в наявності</span>
            </div>
          )}
        </div>

        {/* ІНФОРМАЦІЯ */}
        <div className="p-4">
          <div className="text-xs text-text/50 uppercase tracking-wider mb-1">{product.brand}</div>
          <h3 className="font-semibold text-text text-base mb-1 line-clamp-1 group-hover:text-button transition-colors">
            {product.name}
          </h3>
          <p className="text-text/60 text-sm mb-3 line-clamp-2">{product.description}</p>

          {/* РЕЙТИНГ */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-text/50">({product.reviewCount || 0})</span>
          </div>

          {/* ЦІНА ТА РОЗМІРИ */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-text">{product.price} грн</span>
              {product.originalPrice && <span className="text-sm text-text/40 line-through">{product.originalPrice} грн</span>}
            </div>
            {displaySizes.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {displaySizes.map((size) => (
                    <span key={size} className="inline-block w-6 h-6 bg-accent rounded-full text-center text-xs leading-6 font-medium">
                      {size}
                    </span>
                  ))}
                </div>
                {Object.keys(sizeColorMatrix).length > 3 && <span className="text-xs text-text/50">+{Object.keys(sizeColorMatrix).length - 3}</span>}
              </div>
            )}
          </div>

          {/* КНОПКА */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || !finalSize}
            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 ${
              inStock && finalSize 
                ? 'bg-button text-text hover:bg-button-hover active:bg-button-active shadow-sm hover:shadow' 
                : 'bg-accent text-text/40 cursor-not-allowed'
            }`}
          >
            {inStock && finalSize ? 'Додати в кошик' : 'Немає'}
          </button>
        </div>
      </div>
    </Link>
  );
};