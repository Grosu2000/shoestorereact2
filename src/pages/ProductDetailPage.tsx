import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ProductGallery } from "../components/product/ProductGallery";
import { ReviewList } from "../components/review/ReviewList";
import { ReviewForm } from "../components/review/ReviewForm";
import { Button } from "../components/ui/Button";
import { mockProducts } from "../utils/constants";
import { useCartStore } from "../stores/cart-store";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Товар не знайдено
          </h1>
          <Link to="/products">
            <Button>Повернутися до товарів</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Будь ласка, оберіть розмір і колір");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor);
    }

    alert("Товар додано до кошика!");
    navigate("/cart");
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      alert("Будь ласка, оберіть розмір і колір");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor);
    }

    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-gray-400 hover:text-gray-500">
                Головна
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <Link
                to="/products"
                className="text-gray-400 hover:text-gray-500"
              >
                Товари
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mt-2">{product.brand}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900">
                {product.price} грн
              </div>
              {product.originalPrice && (
                <div className="text-xl text-gray-500 line-through">
                  {product.originalPrice} грн
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {"★".repeat(Math.floor(product.rating))}
                  {"☆".repeat(5 - Math.floor(product.rating))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({product.reviewCount} відгуків)
                </span>
              </div>
              <span
                className={`px-2 py-1 text-sm rounded-full ${
                  product.inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.inStock ? "В наявності" : "Немає в наявності"}
              </span>
            </div>

            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Розмір
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeInfo) => (
                    <button
                      key={sizeInfo.size}
                      onClick={() => setSelectedSize(sizeInfo.size)}
                      disabled={sizeInfo.stock === 0}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedSize === sizeInfo.size
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : sizeInfo.stock === 0
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {sizeInfo.size}
                      {sizeInfo.stock === 0 && " (немає)"}
                      {sizeInfo.stock > 0 &&
                        sizeInfo.stock < 5 &&
                        ` (${sizeInfo.stock} шт.)`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Колір
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedColor === color
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Кількість
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Залишилось: {product.stockQuantity} шт.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className="flex-1"
              >
                Додати до кошика
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className="flex-1"
              >
                Купити зараз
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Характеристики</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Бренд:</span>
                  <span className="ml-2 text-gray-900">{product.brand}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Матеріал:</span>
                  <span className="ml-2 text-gray-900">{product.material}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Країна:</span>
                  <span className="ml-2 text-gray-900">{product.country}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Рік випуску:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {product.releaseYear}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <ReviewList reviews={[]} />

              <div className="mt-8">
                <ReviewForm
                  productId={product.id}
                  onSubmit={async (reviewData) => {
                    const newReview = {
                      id: Date.now().toString(),
                      productId: product.id,
                      userId: "current-user",
                      userName: "Анонімний користувач",
                      ...reviewData,
                      createdAt: new Date().toISOString(),
                      likes: 0,
                      dislikes: 0,
                    };

                    console.log("Новий відгук:", newReview);
                    alert("Дякуємо за ваш відгук!");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
