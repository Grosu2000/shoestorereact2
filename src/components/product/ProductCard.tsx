import React, { useState } from "react";
import type { Product } from "../../types/product";
import { useCartStore } from "../../stores/cart-store";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0]?.size || ""
  );
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor);
  };

  const availableSizes = product.sizes.filter((size) => size.stock > 0);
  const isAnySizeAvailable = availableSizes.length > 0;
  const isNewProduct =
    new Date(product.createdAt).getTime() >
    Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 днів
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="product-card card-hover group">
      <div className="product-image-container">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        </Link>

        {/* Бейджи */}
        {discountPercentage > 0 && (
          <span className="discount-badge">-{discountPercentage}%</span>
        )}

        {isNewProduct && <span className="new-badge">NEW</span>}

        <span
          className={
            product.inStock && isAnySizeAvailable
              ? "stock-badge"
              : "out-of-stock-badge"
          }
        >
          {product.inStock && isAnySizeAvailable ? "В наявності" : "Немає"}
        </span>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/product/${product.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-text group-hover:text-button transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
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
              {"★".repeat(Math.floor(product.rating))}
              {"☆".repeat(5 - Math.floor(product.rating))}
            </div>
            <span className="text-sm text-text/60 ml-1.5">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="input-label">Розмір:</label>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((sizeInfo) => (
                <button
                  key={sizeInfo.size}
                  onClick={() => setSelectedSize(sizeInfo.size)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    selectedSize === sizeInfo.size
                      ? "bg-button text-text border-button font-medium"
                      : "bg-white border-accent text-text/70 hover:border-button hover:text-text"
                  } ${sizeInfo.stock < 3 ? "relative" : ""}`}
                  disabled={sizeInfo.stock === 0}
                  title={
                    sizeInfo.stock < 3
                      ? `Залишилось: ${sizeInfo.stock} шт.`
                      : ""
                  }
                >
                  {sizeInfo.size}
                  {sizeInfo.stock < 3 && sizeInfo.stock > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Колір:</label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    selectedColor === color
                      ? "border-button scale-110"
                      : "border-accent hover:scale-105"
                  }`}
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-text/60 mb-4">
          <span>Доступно розмірів: {availableSizes.length}</span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-success mr-1.5"></span>
            {product.inStock && isAnySizeAvailable
              ? "Готово до відправки"
              : "Під замовлення"}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || !isAnySizeAvailable}
          className={`w-full ${
            product.inStock && isAnySizeAvailable
              ? "btn-primary"
              : "btn-secondary"
          }`}
        >
          {product.inStock && isAnySizeAvailable
            ? "Додати до кошика"
            : "Повідомити про наявність"}
        </button>
      </div>
    </div>
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
  };

  return colorMap[colorName] || "#D8E2EB";
}
