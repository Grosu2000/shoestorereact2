import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useCartStore } from "../stores/cart-store";
import { api } from "../services/api";
import type { Product } from "../types/product";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("ID товару не знайдено");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMainImageLoaded(false);
        const response = await api.get<any>(`/products/${id}`);
        let productData = null;

        if (response.data) {
          productData = response.data;
        } else if (response.id) {
          productData = response;
        } else if (response.success && response.data) {
          productData = response.data;
        }

        if (productData) {
          setProduct(productData);
          if (productData.sizes?.length) {
            setSelectedSize(productData.sizes[0].size);
          }
          if (productData.colors?.length) {
            setSelectedColor(productData.colors[0]);
          }
        } else {
          setError("Товар не знайдено");
        }
      } catch (err: any) {
        setError(err.message || "Помилка завантаження товару");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const sizes = product?.sizes || [];
  const colors = product?.colors || [];

  // Знаходимо вибраний розмір та його залишок
  const selectedSizeInfo = sizes.find((s: any) => s.size === selectedSize);
  const maxAvailable = selectedSizeInfo?.stock || 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxAvailable) {
      alert(`Доступно лише ${maxAvailable} шт. цього розміру`);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      alert("Будь ласка, оберіть розмір");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert("Будь ласка, оберіть колір");
      return;
    }
    if (quantity > maxAvailable) {
      alert(`Доступно лише ${maxAvailable} шт. цього розміру`);
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    alert(`Товар додано до кошика! (${quantity} шт.)`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!selectedSize) {
      alert("Будь ласка, оберіть розмір");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert("Будь ласка, оберіть колір");
      return;
    }
    if (quantity > maxAvailable) {
      alert(`Доступно лише ${maxAvailable} шт. цього розміру`);
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-soft">
          <h1 className="text-2xl font-bold text-error mb-4">
            {error || "Товар не знайдено"}
          </h1>
          <p className="text-text/70 mb-6">
            Можливо, товар було видалено або посилання неправильне.
          </p>
          <Link to="/products">
            <Button>Повернутися до товарів</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/images/placeholder.jpg"];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-text/60">
            <li>
              <Link to="/" className="hover:text-text">
                Головна
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/products" className="hover:text-text">
                Товари
              </Link>
            </li>
            <li>/</li>
            <li className="text-text font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ГАЛЕРЕЯ ЗОБРАЖЕНЬ */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-accent">
              <div className="aspect-square">
                <img
                  key={images[selectedImageIndex]}
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${mainImageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setMainImageLoaded(true)}
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setMainImageLoaded(false);
                    }}
                    className={`bg-white rounded-xl overflow-hidden border-2 transition-all hover:opacity-80 ${
                      selectedImageIndex === idx
                        ? "border-button shadow-soft"
                        : "border-accent opacity-70"
                    }`}
                  >
                    <div className="aspect-square">
                      <img
                        src={img}
                        alt={`${product.name} - фото ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ІНФОРМАЦІЯ ПРО ТОВАР */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-text/60 mb-2">{product.brand}</div>
              <h1 className="text-3xl font-bold text-text">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-text">
                {product.price} грн
              </div>
              {product.originalPrice && (
                <div className="text-lg text-text/40 line-through">
                  {product.originalPrice} грн
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="flex text-amber-500">
                  {"★".repeat(Math.floor(product.rating || 0))}
                  {"☆".repeat(5 - Math.floor(product.rating || 0))}
                </div>
                <span className="ml-2 text-text/60">
                  ({product.reviewCount || 0} відгуків)
                </span>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full bg-success/20 text-success-dark`}
              >
                {product.inStock ? "В наявності" : "Немає"}
              </span>
            </div>

            <p className="text-text/80 leading-relaxed">
              {product.description}
            </p>

            {/* Вибір розміру */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Розмір
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sizeInfo: any) => (
                    <button
                      key={sizeInfo.size}
                      onClick={() => handleSizeChange(sizeInfo.size)}
                      disabled={sizeInfo.stock === 0}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedSize === sizeInfo.size
                          ? "border-button bg-button/20 text-text font-medium"
                          : sizeInfo.stock === 0
                            ? "border-accent bg-accent/30 text-text/40 cursor-not-allowed"
                            : "border-accent hover:border-button"
                      }`}
                    >
                      {sizeInfo.size}
                      {sizeInfo.stock === 0 && " (немає)"}
                      {sizeInfo.stock > 0 && sizeInfo.stock < 5 && ` (лише ${sizeInfo.stock})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Вибір кольору */}
            {colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Колір
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedColor === color
                          ? "border-button bg-button/20 text-text"
                          : "border-accent hover:border-button"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Кількість з обмеженням */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Кількість
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-accent rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-2 text-text hover:bg-accent rounded-l-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-text min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 text-text hover:bg-accent rounded-r-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= maxAvailable}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-text/60">
                  Доступно: {maxAvailable} шт.
                </span>
              </div>
              {maxAvailable < 5 && maxAvailable > 0 && (
                <p className="text-xs text-error mt-1">
                  Увага! Залишилось лише {maxAvailable} шт.
                </p>
              )}
            </div>

            {/* Кнопки дії */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleAddToCart} 
                className="flex-1" 
                size="lg"
                disabled={maxAvailable === 0}
              >
                {maxAvailable === 0 ? "Немає в наявності" : "Додати до кошика"}
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="secondary"
                className="flex-1"
                size="lg"
                disabled={maxAvailable === 0}
              >
                {maxAvailable === 0 ? "Немає в наявності" : "Купити зараз"}
              </Button>
            </div>

            {/* Характеристики */}
            {(product.material || product.country || product.releaseYear) && (
              <div className="border-t border-accent pt-6">
                <h3 className="text-lg font-semibold mb-4">Характеристики</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.material && (
                    <div>
                      <span className="text-text/60">Матеріал:</span>{" "}
                      {product.material}
                    </div>
                  )}
                  {product.country && (
                    <div>
                      <span className="text-text/60">Країна:</span>{" "}
                      {product.country}
                    </div>
                  )}
                  {product.releaseYear && (
                    <div>
                      <span className="text-text/60">Рік випуску:</span>{" "}
                      {product.releaseYear}
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