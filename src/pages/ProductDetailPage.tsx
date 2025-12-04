import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ProductGallery } from "../components/product/ProductGallery";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useCartStore } from "../stores/cart-store";
import { api } from "../services/api";
import type { Product } from "../types/product";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  console.log('🟢 ProductDetailPage завантажено з ID:', id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("ID товару не знайдено");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Запит товару:', id);
        
        
        const response = await api.get<any>(`/products/${id}`);
        console.log('📡 Відповідь API:', response);
        
        
        if (response.data) {
          console.log('✅ Товар знайдено:', response.data.name);
          setProduct(response.data);
        } 
        
        else if (response.id) {
          console.log('✅ Товар знайдено (прямий об\'єкт):', response.name);
          setProduct(response);
        }
        
        else if (response.success && response.data) {
          console.log('✅ Товар знайдено (успіх):', response.data.name);
          setProduct(response.data);
        }
        else {
          console.error('❌ Невідомий формат відповіді:', response);
          setError("Невідомий формат відповіді від сервера");
        }
        
      } catch (err: any) {
        console.error('💥 Помилка завантаження товару:', err);
        setError(err.message || "Помилка при завантаженні товару");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Товар не знайдено"}
          </h1>
          <p className="text-gray-600 mb-6">
            Не вдалося завантажити товар. Спробуйте пізніше.
          </p>
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

    addItem(product, selectedSize, selectedColor, quantity);
    alert("Товар додано до кошика!");
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      alert("Будь ласка, оберіть розмір і колір");
      return;
    }

    addItem(product, selectedSize, selectedColor, quantity);
    navigate("/cart");
  };

  
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const images = product.images || ['/images/placeholder.jpg'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Хлібні крихти */}
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
              <Link to="/products" className="text-gray-400 hover:text-gray-500">
                Товари
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Галерея зображень */}
          <div>
            <ProductGallery images={images} productName={product.name} />
          </div>

          {/* Інформація про товар */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mt-2">{product.brand}</p>
            </div>

            {/* Ціна */}
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900">
                {product.price} грн
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-xl text-gray-500 line-through">
                  {product.originalPrice} грн
                </div>
              )}
            </div>

            {/* Рейтинг та наявність */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {"★".repeat(Math.floor(product.rating || 0))}
                  {"☆".repeat(5 - Math.floor(product.rating || 0))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({product.reviewCount || 0} відгуків)
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

            {/* Опис */}
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Вибір розміру, кольору, кількості */}
            <div className="space-y-4">
              {/* Розміри */}
              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Розмір
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((sizeInfo) => (
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
                        {sizeInfo.stock > 0 && sizeInfo.stock < 5 && ` (${sizeInfo.stock} шт.)`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Кольори */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Колір
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
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
              )}

              {/* Кількість */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Кількість
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
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
                    Залишилось: {product.stock || 0} шт.
                  </span>
                </div>
              </div>
            </div>

            {/* Кнопки дій */}
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
                variant="primary"
                className="flex-1"
              >
                Купити зараз
              </Button>
            </div>

            {/* Характеристики */}
            {(product.brand || product.material || product.country || product.releaseYear) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Характеристики</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.brand && (
                    <div>
                      <span className="font-medium text-gray-600">Бренд:</span>
                      <span className="ml-2 text-gray-900">{product.brand}</span>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <span className="font-medium text-gray-600">Матеріал:</span>
                      <span className="ml-2 text-gray-900">{product.material}</span>
                    </div>
                  )}
                  {product.country && (
                    <div>
                      <span className="font-medium text-gray-600">Країна:</span>
                      <span className="ml-2 text-gray-900">{product.country}</span>
                    </div>
                  )}
                  {product.releaseYear && (
                    <div>
                      <span className="font-medium text-gray-600">Рік випуску:</span>
                      <span className="ml-2 text-gray-900">{product.releaseYear}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};