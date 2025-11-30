import React, { useState } from "react";
import type { Product } from "../../types/product";
import { Button } from "../ui/Button";
import { useCartStore } from "../../stores/cart-store";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].size);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor);
  };

  // Перевірка чи є доступні розміри
  const availableSizes = product.sizes.filter(size => size.stock > 0);
  const isAnySizeAvailable = availableSizes.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-1 aspect-h-1 bg-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {product.name}
            </h3>
          </Link>
          <span className="text-sm text-gray-500">{product.brand}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {product.price} грн
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice} грн
              </span>
            )}
          </div>

          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600 ml-1">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Розмір:</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={!isAnySizeAvailable}
            >
              {availableSizes.map((sizeInfo) => (
                <option key={sizeInfo.size} value={sizeInfo.size}>
                  {sizeInfo.size} {sizeInfo.stock < 5 ? `(${sizeInfo.stock} шт.)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Колір:</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {product.colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>Доступно розмірів: {availableSizes.length}</span>
          <span className={product.inStock && isAnySizeAvailable ? 'text-green-600' : 'text-red-600'}>
            {product.inStock && isAnySizeAvailable ? 'В наявності' : 'Немає в наявності'}
          </span>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || !isAnySizeAvailable}
          className="w-full"
        >
          {product.inStock && isAnySizeAvailable ? 'Додати до кошика' : 'Немає в наявності'}
        </Button>
      </div>
    </div>
  );
};