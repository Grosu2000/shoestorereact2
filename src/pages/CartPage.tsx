import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart-store";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { getFirstImage } from "../utils/imageHelpers";

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
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
      setRemovingId(`${item.product.id}-${item.selectedSize}-${item.selectedColor}`);
      setTimeout(() => {
        removeItem(item.product.id, item.selectedSize, item.selectedColor);
        setRemovingId(null);
        showToast("Товар видалено з кошика", "info");
      }, 200);
      return;
    }
    updateQuantity(item.product.id, item.selectedSize, item.selectedColor, newQuantity);
  };

  const handleContinueShopping = () => navigate("/products");
  
  const handleCheckout = () => {
    if (cart.items.length === 0) {
      showToast("Кошик порожній", "error");
      return;
    }
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-3xl mx-auto px-4 text-center py-16">
          <div className="text-6xl mb-4 opacity-50">🛒</div>
          <h1 className="text-2xl font-bold text-text mb-4">Кошик порожній</h1>
          <p className="text-text/60 mb-8 max-w-md mx-auto">
            Додайте товари до кошика, щоб зробити покупку. У нас є багато чудових пар взуття, які чекають на вас!
          </p>
          <Button onClick={handleContinueShopping} size="lg" className="px-8 py-3 text-lg">
            Перейти до товарів
          </Button>
        </div>
      </div>
    );
  }

  const deliveryCost = 50;
  const freeDeliveryThreshold = 2000;
  const isFreeDelivery = cart.total >= freeDeliveryThreshold;
  const finalDeliveryCost = isFreeDelivery ? 0 : deliveryCost;
  const totalWithDelivery = cart.total + finalDeliveryCost;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Кошик</h1>
            <p className="text-text/60 mt-1">
              {cart.itemCount} товар{cart.itemCount !== 1 ? "и" : ""} · {getTotalPrice()} грн
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            disabled={isClearing}
            className="px-6"
          >
            {isClearing ? "Очищення..." : "Очистити кошик"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ліва колонка - список товарів */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => {
              const itemKey = `${item.product.id}-${item.selectedSize}-${item.selectedColor}`;
              const isRemoving = removingId === itemKey;
              
              return (
                <div
                  key={itemKey}
                  className={`bg-white rounded-xl shadow-soft border border-accent overflow-hidden transition-all duration-300 ${
                    isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    {/* Зображення товару */}
                    <div className="flex-shrink-0">
                      <img
                        src={getFirstImage(item.product.images)}
                        alt={item.product.name}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                        }}
                      />
                    </div>

                    {/* Інформація про товар */}
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <Link to={`/product/${item.product.id}`}>
                            <h3 className="text-lg font-semibold text-text hover:text-button transition">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-text/60 text-sm mt-1">{item.product.brand}</p>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm">
                            <span className="bg-accent/50 px-2 py-0.5 rounded-full">
                              Розмір: {item.selectedSize}
                            </span>
                            <span className="bg-accent/50 px-2 py-0.5 rounded-full">
                              Колір: {item.selectedColor}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-text">
                            {item.product.price * item.quantity} грн
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-text/50">
                              {item.product.price} грн × {item.quantity}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-accent/50">
                        {/* Кількість */}
                        <div className="flex items-center border border-accent rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-text hover:bg-accent rounded-l-lg transition disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-text hover:bg-accent rounded-r-lg transition"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleQuantityChange(item, 0)}
                          className="text-text/40 hover:text-error transition p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Права колонка - підсумок */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6 sticky top-8">
              <h2 className="text-xl font-bold text-text mb-6">Підсумок замовлення</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-text/80">
                  <span>Товари ({cart.itemCount} шт.)</span>
                  <span>{cart.total} грн</span>
                </div>

                <div className="flex justify-between text-text/80">
                  <span>Доставка</span>
                  <div className="text-right">
                    {isFreeDelivery ? (
                      <span className="text-success font-medium">Безкоштовно</span>
                    ) : (
                      <span>{deliveryCost} грн</span>
                    )}
                  </div>
                </div>

                {!isFreeDelivery && cart.total < freeDeliveryThreshold && (
                  <div className="bg-accent/30 rounded-lg p-3 text-sm">
                    <p className="text-text/70">
                      Додайте товарів на <span className="font-bold text-button">{freeDeliveryThreshold - cart.total} грн</span> для безкоштовної доставки
                    </p>
                    <div className="mt-2 h-1.5 bg-accent rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all duration-300"
                        style={{ width: `${(cart.total / freeDeliveryThreshold) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <hr className="border-accent my-2" />

                <div className="flex justify-between text-xl font-bold text-text">
                  <span>Загальна сума</span>
                  <span>{totalWithDelivery} грн</span>
                </div>

                <p className="text-xs text-text/50 text-center">
                  Ціна включає ПДВ та всі податки
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <Button onClick={handleCheckout} className="w-full py-3 text-lg font-medium">
                  Оформити замовлення
                </Button>

                <Button onClick={handleContinueShopping} variant="outline" className="w-full py-3">
                  Продовжити покупки
                </Button>

                <div className="flex justify-center gap-4 pt-4 text-text/40 text-sm">
                  <span>🔒 Безпечна оплата</span>
                  <span>🔄 Гарантія повернення</span>
                  <span>📦 30 днів на обмін</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};