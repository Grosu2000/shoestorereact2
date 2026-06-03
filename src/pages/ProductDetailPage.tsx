import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useCartStore } from "../stores/cart-store";
import { useWishlist } from "../hooks/useWishlist";
import { useAuthStore } from "../stores/auth-store";
import { useToast } from "../contexts/ToastContext";
import { api } from "../services/api";
import { reviewApi } from "../services/review.api";
import { ReviewList } from "../components/review/ReviewList";
import type { Product } from "../types/product";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);

  // Стан для форми відгуку
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const images = product?.images?.length
    ? product.images
    : ["/images/placeholder.jpg"];

  const sizeColorMatrix = product?.sizeColorMatrix || {};
  const sizes = Object.keys(sizeColorMatrix);
  const colorsSet = new Set<string>();
  Object.values(sizeColorMatrix).forEach((colorMap: any) => {
    Object.keys(colorMap).forEach((color) => colorsSet.add(color));
  });
  const colors = Array.from(colorsSet);

  const maxAvailable = sizeColorMatrix[selectedSize]?.[selectedColor] || 0;
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const discountPercent = product?.discountPercent || 0;
  const finalPrice =
    discountPercent > 0
      ? (product?.price || 0) * (1 - discountPercent / 100)
      : product?.price || 0;

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
          const firstSize = Object.keys(productData.sizeColorMatrix || {})[0];
          if (firstSize) {
            setSelectedSize(firstSize);
            const firstColor = Object.keys(
              productData.sizeColorMatrix[firstSize] || {},
            )[0];
            if (firstColor) setSelectedColor(firstColor);
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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxAvailable) {
      showToast(
        `Доступно лише ${maxAvailable} шт. цього розміру та кольору`,
        "error",
      );
      return;
    }
    setQuantity(newQuantity);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const availableColors = Object.keys(sizeColorMatrix[size] || {});
    if (
      !availableColors.includes(selectedColor) &&
      availableColors.length > 0
    ) {
      setSelectedColor(availableColors[0]);
    }
    setQuantity(1);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setQuantity(1);
  };

  const handleWishlist = async () => {
    if (!product) return;

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
  };
const cartItems = useCartStore((state) => state.cart.items);

  const handleAddToCart = () => {
  if (!product) return;
  if (!selectedSize) {
    showToast("Будь ласка, оберіть розмір", "error");
    return;
  }
  if (!selectedColor) {
    showToast("Будь ласка, оберіть колір", "error");
    return;
  }
  
  const currentInCart = cartItems.find(
  (item: any) => item.product.id === product.id && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
)?.quantity || 0;
  
  const totalAfterAdd = currentInCart + quantity;
  
  if (totalAfterAdd > maxAvailable) {
    showToast(`Ви не можете додати більше ${maxAvailable} шт. цього товару (в кошику вже ${currentInCart})`, "error");
    return;
  }
  
  addItem(product, selectedSize, selectedColor, quantity);
  showToast(`Товар додано до кошика! (${quantity} шт.)`, "success");
};

  const handleBuyNow = () => {
    if (!product) return;
    if (!selectedSize) {
      showToast("Будь ласка, оберіть розмір", "error");
      return;
    }
    if (!selectedColor) {
      showToast("Будь ласка, оберіть колір", "error");
      return;
    }
    if (quantity > maxAvailable) {
      showToast(
        `Доступно лише ${maxAvailable} шт. цього розміру та кольору`,
        "error",
      );
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    navigate("/cart");
  };

  // Функція для відправки відгуку
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Увійдіть, щоб залишити відгук", "error");
      navigate("/login");
      return;
    }

    if (reviewRating === 0) {
      showToast("Будь ласка, оберіть рейтинг", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewApi.create(product!.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      showToast(
        "Відгук додано! Після модерації він з'явиться на сайті",
        "success",
      );
      setReviewRating(0);
      setReviewComment("");
      // Оновлюємо список відгуків
      window.dispatchEvent(new Event("review-added"));
    } catch (error: any) {
      showToast(error.message || "Помилка додавання відгуку", "error");
    } finally {
      setIsSubmittingReview(false);
    }
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


  const availableColorsForSize = Object.keys(
    sizeColorMatrix[selectedSize] || {},
  );

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
              <div className="flex items-baseline gap-2">
                {discountPercent > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-error">
                      {Math.round(finalPrice)} грн
                    </span>
                    <span className="text-lg text-text/40 line-through">
                      {product.price} грн
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-text">
                    {product.price} грн
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-lg text-text/40 line-through">
                    {product.originalPrice} грн
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{discountPercent}%
                </span>
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
                className={`px-2 py-1 text-xs rounded-full ${product.inStock ? "bg-success/20 text-success-dark" : "bg-error/20 text-error"}`}
              >
                {product.inStock ? "В наявності" : "Немає"}
              </span>
            </div>

            <p className="text-text/80 leading-relaxed border-l-4 border-button pl-4 italic">
              {product.description}
            </p>

            {/* Вибір розміру */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Розмір
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const totalStockForSize = Object.values(
                      sizeColorMatrix[size] || {},
                    ).reduce(
                      (sum: number, stock: any) => sum + (stock || 0),
                      0,
                    );
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        disabled={totalStockForSize === 0}
                        className={`px-4 py-2 border rounded-lg transition-all ${
                          selectedSize === size
                            ? "border-button bg-button/20 text-text font-medium"
                            : totalStockForSize === 0
                              ? "border-accent bg-accent/30 text-text/40 cursor-not-allowed"
                              : "border-accent hover:border-button"
                        }`}
                      >
                        {size}
                        {totalStockForSize === 0 && " (немає)"}
                        {totalStockForSize > 0 &&
                          totalStockForSize < 5 &&
                          ` (лише ${totalStockForSize})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Вибір кольору */}
            {colors.length > 0 && selectedSize && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Колір
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableColorsForSize.map((color) => {
                    const stockForColor =
                      sizeColorMatrix[selectedSize]?.[color] || 0;
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        disabled={stockForColor === 0}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedColor === color
                            ? "border-button bg-button/20 text-text"
                            : stockForColor === 0
                              ? "border-accent bg-accent/30 text-text/40 cursor-not-allowed"
                              : "border-accent hover:border-button"
                        }`}
                      >
                        {color}
                        {stockForColor > 0 &&
                          stockForColor < 5 &&
                          ` (${stockForColor})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Кількість */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Кількість
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-accent rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-2 text-text hover:bg-accent rounded-l-lg transition disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-text min-w-[50px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 text-text hover:bg-accent rounded-r-lg transition disabled:opacity-50"
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
                onClick={handleWishlist}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "fill-none"}`}
                    fill="none"
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
                  {isWishlisted ? "У бажаннях" : "Додати в бажання"}
                </span>
              </Button>
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
                disabled={maxAvailable === 0 || !selectedSize || !selectedColor}
              >
                {maxAvailable === 0 ? "Немає в наявності" : "Додати до кошика"}
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="secondary"
                className="flex-1"
                size="lg"
                disabled={maxAvailable === 0 || !selectedSize || !selectedColor}
              >
                Купити зараз
              </Button>
            </div>

            {/* Характеристики */}
            <div className="border-t border-accent pt-6">
              <h3 className="text-lg font-semibold mb-4">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.material && (
                  <div className="flex justify-between items-center py-2 border-b border-accent/30">
                    <span className="text-text/60">Матеріал:</span>
                    <span className="font-medium text-text">
                      {product.material}
                    </span>
                  </div>
                )}
                {product.country && (
                  <div className="flex justify-between items-center py-2 border-b border-accent/30">
                    <span className="text-text/60">Країна:</span>
                    <span className="font-medium text-text">
                      {product.country}
                    </span>
                  </div>
                )}
                {product.releaseYear && (
                  <div className="flex justify-between items-center py-2 border-b border-accent/30">
                    <span className="text-text/60">Рік випуску:</span>
                    <span className="font-medium text-text">
                      {product.releaseYear}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-accent/30">
                  <span className="text-text/60">Артикул:</span>
                  <span className="font-medium text-text">
                    {product.id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>

            {/* ФОРМА ВІДГУКУ */}
            <div className="border-t border-accent pt-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">Залишити відгук</h3>

              {!user ? (
                <div className="bg-white p-6 rounded-xl shadow-soft border border-accent text-center">
                  <p className="text-text/60 mb-3">
                    Увійдіть, щоб залишити відгук
                  </p>
                  <Link to="/login">
                    <Button variant="outline">Увійти</Button>
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-white p-6 rounded-xl shadow-soft border border-accent space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Ваша оцінка
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-2xl focus:outline-none transition hover:scale-110"
                        >
                          {star <= reviewRating ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Ваш коментар
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-button"
                      placeholder="Поділіться враженнями про товар..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingReview || reviewRating === 0}
                    className="w-full"
                  >
                    {isSubmittingReview ? "Відправка..." : "Надіслати відгук"}
                  </Button>
                </form>
              )}
            </div>

            {/* СПИСОК ВІДГУКІВ */}
            <div className="pt-4">
              <ReviewList productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
