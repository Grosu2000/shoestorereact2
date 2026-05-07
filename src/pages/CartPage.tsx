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
          <div className="text-7xl mb-6 opacity-50">🛒</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-4">Кошик порожній</h1>
          <p className="text-text/60 mb-8">Додайте товари до кошика, щоб зробити покупку.</p>
          <Button onClick={handleContinueShopping} size="lg">Перейти до товарів</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Кошик</h1>
            <p className="text-text/60 mt-1 text-sm sm:text-base">
              {cart.itemCount} товар{cart.itemCount !== 1 ? "и" : ""} · {getTotalPrice()} грн
            </p>
          </div>
          <Button variant="outline" onClick={handleClearCart} disabled={isClearing} className="w-full sm:w-auto">
            {isClearing ? "Очищення..." : "Очистити кошик"}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cart.items.map((item, index) => (
              <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="bg-white rounded-xl shadow-soft border border-accent p-4">
                <div className="flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                    onError={(e) => ((e.target as HTMLImageElement).src = "/images/placeholder.jpg")}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-text">{item.product.name}</h3>
                        <p className="text-text/60 text-sm">{item.product.brand}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                        className="text-text/40 hover:text-error transition p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-text/60">
                      <span className="bg-accent/30 px-2 py-0.5 rounded-full">Розмір: {item.selectedSize}</span>
                      <span className="bg-accent/30 px-2 py-0.5 rounded-full">Колір: {item.selectedColor}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center border border-accent rounded-lg">
                        <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-accent" disabled={item.quantity <= 1}>-</button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-accent">+</button>
                      </div>
                      <div className="font-bold text-text">{item.product.price * item.quantity} грн</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-soft border border-accent p-5 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Підсумок</h2>
              <div className="space-y-3 text-text/80">
                <div className="flex justify-between"><span>Товари</span><span>{cart.total} грн</span></div>
                <div className="flex justify-between"><span>Доставка</span><span className="text-success">Безкоштовно</span></div>
                <hr className="border-accent" />
                <div className="flex justify-between text-xl font-bold text-text"><span>Всього</span><span>{cart.total} грн</span></div>
              </div>
              <Button onClick={handleCheckout} className="w-full mt-6 py-3">Оформити замовлення</Button>
              <Button variant="outline" onClick={handleContinueShopping} className="w-full mt-3">Продовжити покупки</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
