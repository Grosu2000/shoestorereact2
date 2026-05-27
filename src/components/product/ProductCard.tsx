import React, { useState } from "react";
import type { Product } from "../../types/product";
import { useCartStore } from "../../stores/cart-store";
import { Link, useNavigate } from "react-router-dom";
import { useCompareStore } from "../../stores/compare-store";
import { useWishlist } from "../../hooks/useWishlist";
import { useAuthStore } from "../../stores/auth-store";
import { useToast } from "../../contexts/ToastContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const images = product.images?.length
    ? product.images
    : ["/images/placeholder.jpg"];
  const [currentImage, setCurrentImage] = useState(0);
    const [, setIsHovering] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const isWishlisted = isInWishlist(product.id);

  const variants = product.variants || [];
  const colors = product.colors || [];

  // Отримуємо унікальні розміри з variants
  const uniqueSizes = [...new Set(variants.map((v: any) => v.size))];

  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const addItem = useCartStore((state) => state.addItem);

  const {
    addItem: addToCompare,
    removeItem: removeFromCompare,
    isInCompare,
  } = useCompareStore();
  const isCompared = isInCompare(product.id);

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!user) {
        showToast("Увійдіть, щоб додати до списку бажаних", "error");
        navigate("/login");
        return;
      }

      if (isWishlisted) {
        await removeFromWishlist(product.id);
        showToast("Товар видалено зі списку бажаних", "info");
      } else {
        await addToWishlist(product.id);
        showToast("Товар додано до списку бажаних", "success");
      }
    } catch (err) {
      console.error("Wishlist action failed:", err);
      showToast("Сталася помилка, спробуйте пізніше", "error");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, selectedSize, selectedColor, 1);
  };

  const availableVariants = variants.filter((v: any) => v.stock > 0);
  const isAnySizeAvailable = availableVariants.length > 0;

  // Для вибору розміру в картці
  const sizesList = uniqueSizes.map(size => ({
    size,
    stock: variants.filter((v: any) => v.size === size).reduce((sum, v) => sum + v.stock, 0)
  })).filter(s => s.stock > 0);

  const isNewProduct = product.createdAt
    ? new Date(product.createdAt).getTime() >
      Date.now() - 30 * 24 * 60 * 60 * 1000
    : false;

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const inStock =
    product.inStock !== undefined ? product.inStock : isAnySizeAvailable;

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 800);
      (window as any).__hoverInterval = interval;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setCurrentImage(0);
    if ((window as any).__hoverInterval) {
      clearInterval((window as any).__hoverInterval);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div
        className="product-card card-hover group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="product-image-container">
          <img
            src={`${API_URL}${images[0]}`}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
            }}
          />

          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
              {currentImage + 1} / {images.length}
            </div>
          )}

          {discountPercentage > 0 && (
            <span className="discount-badge">-{discountPercentage}%</span>
          )}

          {isNewProduct && <span className="new-badge">NEW</span>}

          <span
            className={
              inStock && isAnySizeAvailable
                ? "stock-badge"
                : "out-of-stock-badge"
            }
          >
            {inStock && isAnySizeAvailable ? "В наявності" : "Немає"}
          </span>

          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition"
            title={isWishlisted ? "Видалити зі списку бажаних" : "Додати до списку бажаних"}
          >
            <svg
              className={`w-5 h-5 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "fill-none text-gray-500"
              }`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text group-hover:text-button transition-colors line-clamp-1">
                {product.name}
              </h3>
            </div>
            <span className="text-sm text-text/60 bg-accent/30 px-2 py-1 rounded">
              {product.brand}
            </span>
          </div>

          <p className="text-text/70 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-text">
                {product.price} грн
              </span>
              {product.originalPrice && (
                <span className="text-sm text-text/40 line-through">
                  {product.originalPrice} грн
                </span>
              )}
            </div>

            <div className="flex items-center">
              <div className="flex text-amber-500">
                {"★".repeat(Math.floor(product.rating || 0))}
                {"☆".repeat(5 - Math.floor(product.rating || 0))}
              </div>
              <span className="text-sm text-text/60 ml-1.5">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>

          {sizesList.length > 0 && (
            <div className="space-y-3 mb-4" onClick={(e) => e.preventDefault()}>
              <div>
                <label className="input-label">Розмір:</label>
                <div className="flex flex-wrap gap-1.5">
                  {sizesList.slice(0, 4).map((sizeInfo) => (
                    <button
                      key={sizeInfo.size}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSize(sizeInfo.size);
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                        selectedSize === sizeInfo.size
                          ? "bg-button text-text border-button font-medium"
                          : "bg-white border-accent text-text/70 hover:border-button hover:text-text"
                      }`}
                    >
                      {sizeInfo.size}
                    </button>
                  ))}
                  {sizesList.length > 4 && (
                    <span className="px-3 py-1.5 text-sm text-text/50">
                      +{sizesList.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {colors.length > 0 && (
                <div>
                  <label className="input-label">Колір:</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.slice(0, 4).map((color) => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedColor(color);
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          selectedColor === color
                            ? "border-button scale-110"
                            : "border-accent hover:scale-105"
                        }`}
                        style={{ backgroundColor: getColorHex(color) }}
                        title={color}
                      />
                    ))}
                    {colors.length > 4 && (
                      <span className="text-xs text-text/50 flex items-center">
                        +{colors.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCompare}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                isCompared
                  ? "bg-accent text-text/70 cursor-default"
                  : "border border-accent text-text hover:border-button hover:bg-accent/30"
              }`}
            >
              {isCompared ? "✓ У порівнянні" : "⇄ Порівняти"}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-text/60 mb-4">
            <span>Доступно розмірів: {sizesList.length}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              {inStock && isAnySizeAvailable ? "Готово" : "Немає"}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || !isAnySizeAvailable}
            className={`w-full ${
              inStock && isAnySizeAvailable ? "btn-primary" : "btn-secondary"
            }`}
          >
            {inStock && isAnySizeAvailable ? "Додати до кошика" : "Немає"}
          </button>
        </div>
      </div>
    </Link>
  );
};

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    Чорний: "#000000",
    Білий: "#FFFFFF",
    Сірий: "#808080",
    Синій: "#0000FF",
    Червоний: "#FF0000",
    Зелений: "#00FF00",
    Жовтий: "#FFFF00",
    Коричневий: "#A52A2A",
    Бежевий: "#F5F5DC",
    Рожевий: "#FFC0CB",
    Фіолетовий: "#800080",
    Салатовий: "#B7E0A0",
    Бірюзовий: "#00CED1",
  };
  return colorMap[colorName] || "#D8E2EB";
}
