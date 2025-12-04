import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart-store";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice
  } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClearCart = () => {
    if (cart.items.length === 0) return;

    setIsClearing(true);
    if (window.confirm("Ви впевнені, що хочете очистити кошик?")) {
      clearCart();
      showToast("Кошик очищено", "success");
    }
    setIsClearing(false);
  };

  const handleQuantityChange = (item: any, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.product.id, item.selectedSize, item.selectedColor);
      showToast("Товар видалено з кошика", "info");
    } else {
      updateQuantity(
        item.product.id,
        item.selectedSize,
        item.selectedColor,
        newQuantity
      );
    }
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      showToast("Кошик порожній", "error");
      return;
    }
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Завантаження кошика...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 text-gray-300 mb-6">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Кошик порожній
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Додайте товари до кошика, щоб зробити покупку. У нас є багато
              чудових пар взуття, які чекають на вас!
            </p>
            <Button
              onClick={handleContinueShopping}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Перейти до товарів
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Кошик</h1>
            <p className="text-gray-600 mt-1">
              {cart.itemCount} товар{cart.itemCount !== 1 ? "и" : ""} •{" "}
              {getTotalPrice()} грн
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            disabled={isClearing || cart.items.length === 0}
            className="px-6"
          >
            {isClearing ? "Очищення..." : "Очистити кошик"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ліва колонка - список товарів */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {cart.items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                >
                  <div className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition-colors">
                    {/* Зображення товару */}
                    <div className="flex-shrink-0">
                      <div className="relative w-32 h-32 md:w-40 md:h-40">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x400?text=No+Image";
                          }}
                        />
                        {/* Видалили discount badge */}
                      </div>
                    </div>

                    {/* Інформація про товар */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {item.product.brand}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeItem(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor
                            );
                            showToast("Товар видалено", "success");
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Видалити товар"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Деталі товару */}
                      <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                            Розмір: {item.selectedSize}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                            Колір: {item.selectedColor}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Кількість */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(item, item.quantity - 1)
                              }
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                              aria-label="Зменшити кількість"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item, item.quantity + 1)
                              }
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                              aria-label="Збільшити кількість"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Ціна */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {item.product.price * item.quantity} грн
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500">
                                {item.product.price} грн × {item.quantity}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Роздільник між товарами */}
                  {index < cart.items.length - 1 && (
                    <hr className="mx-6 border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Права колонка - підсумок */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Підсумок замовлення
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Товари ({cart.itemCount} шт.)</span>
                  <span>{cart.total} грн</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Доставка</span>
                  <span className="text-green-600 font-medium">
                    Безкоштовно
                  </span>
                </div>

                {/* Видалили знижку за суму > 1000 */}

                <hr className="border-gray-200 my-4" />

                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Загальна сума</span>
                  <span>{cart.total} грн</span>
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  <p>Ціна включає ПДВ та всі податки</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Button
                  onClick={handleCheckout}
                  className="w-full py-4 text-lg font-medium"
                  size="lg"
                >
                  Оформити замовлення
                </Button>

                <Button
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="w-full py-4"
                >
                  Продовжити покупки
                </Button>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>
                    Безпечна оплата • Гарантія повернення • 30 днів на обмін
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
