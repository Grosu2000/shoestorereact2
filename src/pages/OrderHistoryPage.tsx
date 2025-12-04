import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { orderApi } from "../services/order.api";
import type { Order, OrderItem } from "../services/order.api";

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getMyOrders();
      setOrders(response.orders || []);
    } catch (err: any) {
      const errorMessage = err.message || "Помилка завантаження замовлень";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Очікує підтвердження";
      case "PROCESSING":
        return "В обробці";
      case "SHIPPED":
        return "Відправлено";
      case "DELIVERED":
        return "Доставлено";
      case "CANCELLED":
        return "Скасовано";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Очікує оплати";
      case "PROCESSING":
        return "В обробці";
      case "PAID":
        return "Оплачено";
      case "FAILED":
        return "Помилка оплати";
      case "REFUNDED":
        return "Повернено";
      default:
        return status;
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Ви дійсно хочете скасувати замовлення?")) return;

    try {
      await orderApi.cancelOrder(orderId);
      showToast("Замовлення скасовано", "success");
      fetchOrders(); // Оновити список
    } catch (err: any) {
      showToast(err.message || "Помилка скасування", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Завантаження замовлень...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Помилка</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={fetchOrders}>Спробувати ще раз</Button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Історія замовлень
            </h1>
            <p className="text-gray-600 mb-8">У вас ще немає замовлень</p>
            <Link to="/products">
              <Button size="lg">Перейти до покупок</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Історія замовлень
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Замовлення #{order.orderNumber}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Дата замовлення:{" "}
                        {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>
                        Спосіб оплати:{" "}
                        {order.paymentMethod === "card"
                          ? "Банківська карта"
                          : order.paymentMethod === "cash"
                          ? "Готівка"
                          : order.paymentMethod === "liqpay"
                          ? "LiqPay"
                          : order.paymentMethod}
                      </p>
                      <p>
                        Спосіб доставки:{" "}
                        {order.deliveryMethod === "nova-poshta"
                          ? "Нова Пошта"
                          : order.deliveryMethod === "ukr-poshta"
                          ? "Укрпошта"
                          : order.deliveryMethod === "courier"
                          ? "Кур'єр"
                          : order.deliveryMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {order.total.toFixed(2)} грн
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {Array.isArray(order.items)
                        ? order.items.reduce(
                            (sum: number, item: OrderItem) =>
                              sum + item.quantity,
                            0
                          )
                        : 0}{" "}
                      товари
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Товари:</h4>
                <div className="space-y-3">
                  {Array.isArray(order.items) &&
                    order.items.map((item: OrderItem, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image || "/images/placeholder.jpg"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/placeholder.jpg";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.size} • {item.color} • {item.quantity} шт.
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.price} грн/шт
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} грн
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="text-sm text-gray-600">
                    <p>
                      Адреса доставки: {order.shippingInfo.city},{" "}
                      {order.shippingInfo.address}
                    </p>
                    <p className="mt-1">
                      Отримувач: {order.shippingInfo.firstName}{" "}
                      {order.shippingInfo.lastName}, {order.shippingInfo.phone}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      Деталі замовлення
                    </Button>
                    {order.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Скасувати
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
