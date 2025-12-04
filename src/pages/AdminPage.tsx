import React, { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { adminApi } from "../services/admin.api";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useForm } from "react-hook-form";

type TabType = "dashboard" | "orders" | "products" | "add-product";

// Додаємо інтерфейс для форми
interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  brand: string;
  colors: string;
  stock: string;
  material?: string;
  features?: string;
}

// Допоміжна функція для отримання тексту помилки
const getErrorMessage = (error: any): string | undefined => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error.message) return String(error.message);
  return 'Помилка';
};

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // ДОДАНО!
  const { showToast } = useToast();

  // Форма для додавання товару
  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProduct,
    formState: { errors: productErrors },
  } = useForm<ProductFormData>();
  
  const [productImages, setProductImages] = useState<File[]>([]);
  const [sizes, setSizes] = useState<Array<{ size: string; stock: number }>>([]);
  const [currentSize, setCurrentSize] = useState("");
  const [currentStock, setCurrentStock] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");
      
      const statsResponse = await adminApi.getStats();
      console.log("Stats response:", statsResponse);
      setStats(statsResponse.stats);

      const ordersResponse = await adminApi.getAllOrders();
      console.log("Orders response:", ordersResponse);
      setOrders(ordersResponse.orders || []);

      const productsResponse = await adminApi.getAllProducts();
      console.log("Products response:", productsResponse);
      setProducts(productsResponse.products || []);
      
    } catch (err: any) {
      console.error("Помилка завантаження даних:", err);
      showToast("Помилка завантаження даних", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      showToast("Статус оновлено", "success");
      fetchDashboardData();
    } catch (err: any) {
      console.error("Помилка оновлення статусу:", err);
      showToast("Помилка оновлення статусу", "error");
    }
  };

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      console.log("Submitting product data:", data);
      
      const formData = new FormData();

      // Додаємо текстові поля
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof ProductFormData];
        if (value !== undefined && value !== null && key !== "images") {
          formData.append(key, String(value));
        }
      });

      // Додаємо розміри як JSON
      if (sizes.length > 0) {
        formData.append("sizes", JSON.stringify(sizes));
      }

      // Додаємо зображення
      productImages.forEach((file) => {
        formData.append("images", file);
      });
      
      // Дебаг: що відправляємо
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Визначаємо чи це редагування чи створення
      if (selectedProduct) {
        // Редагування існуючого товару
        console.log("Updating product:", selectedProduct.id);
        await adminApi.updateProduct(selectedProduct.id, formData);
        showToast("Товар успішно оновлено", "success");
      } else {
        // Створення нового товару
        console.log("Creating new product");
        await adminApi.createProduct(formData);
        showToast("Товар успішно додано", "success");
      }
      
      // Скидаємо стан
      setShowAddProductModal(false);
      resetProduct();
      setProductImages([]);
      setSizes([]);
      setSelectedProduct(null);
      
      // Оновлюємо дані
      fetchDashboardData();
      
    } catch (err: any) {
      console.error("Помилка при збереженні товару:", err);
      const errorMessage = err.message || "Невідома помилка";
      showToast(
        selectedProduct 
          ? `Помилка оновлення товару: ${errorMessage}` 
          : `Помилка додавання товару: ${errorMessage}`, 
        "error"
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей товар?")) {
      return;
    }
    
    try {
      await adminApi.deleteProduct(productId);
      showToast("Товар видалено", "success");
      fetchDashboardData();
    } catch (err: any) {
      console.error("Помилка видалення товару:", err);
      showToast("Помилка видалення товару", "error");
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    
    // Заповнюємо форму даними товару
    resetProduct({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      brand: product.brand,
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : product.colors || "",
      stock: product.stock.toString(),
      material: product.material || "",
      features: Array.isArray(product.features) ? product.features.join(", ") : product.features || "",
    });
    
    // Заповнюємо розміри
    if (product.sizes && Array.isArray(product.sizes)) {
      setSizes(product.sizes);
    }
    
    setProductImages([]); // Скидаємо нові зображення
    setShowAddProductModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setProductImages((prev) => [...prev, ...newImages]);
    }
  };

  const addSize = () => {
    if (currentSize && currentStock) {
      const stockValue = parseInt(currentStock);
      if (!isNaN(stockValue)) {
        setSizes((prev) => [
          ...prev,
          {
            size: currentSize,
            stock: stockValue,
          },
        ]);
        setCurrentSize("");
        setCurrentStock("");
      }
    }
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">
              Завантаження панелі адміністратора...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навігація */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "dashboard"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Дашборд
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "orders"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Замовлення
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "products"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Товари
              </button>
            </div>
            <div>
              <Button onClick={() => setShowAddProductModal(true)} size="sm">
                + Додати товар
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Дашборд */}
        {activeTab === "dashboard" && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  Всього замовлень
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  Загальний дохід
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalRevenue.toFixed(2)} грн
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700">Товарів</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  Користувачів
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalUsers}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Статуси замовлень
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Очікують підтвердження:</span>
                    <span className="font-semibold">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>В обробці:</span>
                    <span className="font-semibold">
                      {stats.processingOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Відправлено:</span>
                    <span className="font-semibold">{stats.shippedOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доставлено:</span>
                    <span className="font-semibold">
                      {stats.deliveredOrders}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Останні замовлення
                </h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">#{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.shippingInfo?.firstName}{" "}
                          {order.shippingInfo?.lastName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {order.total.toFixed(2)} грн
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status === "PENDING"
                            ? "Очікує"
                            : order.status === "DELIVERED"
                            ? "Доставлено"
                            : "В обробці"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Замовлення */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Всі замовлення ({orders.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Номер
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клієнт
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сума
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.shippingInfo?.firstName}{" "}
                          {order.shippingInfo?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.shippingInfo?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {order.total.toFixed(2)} грн
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "SHIPPED"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status === "PENDING"
                            ? "Очікує"
                            : order.status === "PROCESSING"
                            ? "В обробці"
                            : order.status === "SHIPPED"
                            ? "Відправлено"
                            : order.status === "DELIVERED"
                            ? "Доставлено"
                            : "Скасовано"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {order.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "PROCESSING")
                                }
                              >
                                В обробку
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "CANCELLED")
                                }
                              >
                                Скасувати
                              </Button>
                            </>
                          )}
                          {order.status === "PROCESSING" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(order.id, "SHIPPED")
                              }
                            >
                              Відправити
                            </Button>
                          )}
                          {order.status === "SHIPPED" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(order.id, "DELIVERED")
                              }
                            >
                              Завершити
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Товари */}
        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Товари ({products.length})
              </h2>
              <Button onClick={() => setShowAddProductModal(true)} size="sm">
                + Додати товар
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`http://localhost:3000${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Немає зображення
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 truncate">
                      {product.brand} • {product.category}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xl font-bold">
                        {product.price} грн
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock
                          ? `${product.stock} шт`
                          : "Немає в наявності"}
                      </span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEditProduct(product)}
                      >
                        Редагувати
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 flex-1"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Видалити
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальне вікно додавання товару */}
      <Modal
        isOpen={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setSelectedProduct(null);
          resetProduct();
          setProductImages([]);
          setSizes([]);
        }}
        title={selectedProduct ? "Редагувати товар" : "Додати новий товар"}
      >
        <form
          onSubmit={handleSubmitProduct(handleAddProduct)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Назва товару *"
              {...registerProduct("name", { required: "Введіть назву" })}
              error={getErrorMessage(productErrors.name)}
            />
            <Input
              label="Ціна (грн) *"
              type="number"
              step="0.01"
              {...registerProduct("price", {
                required: "Введіть ціну",
                min: { value: 0, message: "Ціна не може бути відʼємною" },
              })}
              error={getErrorMessage(productErrors.price)}
            />
            <Input
              label="Бренд *"
              {...registerProduct("brand", { required: "Введіть бренд" })}
              error={getErrorMessage(productErrors.brand)}
            />
            <Input
              label="Категорія *"
              {...registerProduct("category", {
                required: "Введіть категорію",
              })}
              error={getErrorMessage(productErrors.category)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Опис товару *
            </label>
            <textarea
              {...registerProduct("description", { required: "Введіть опис" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            {productErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {getErrorMessage(productErrors.description)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Розміри та наявність
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Розмір (напр. 42)"
                    value={currentSize}
                    onChange={(e) => setCurrentSize(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Кількість"
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-24"
                  />
                  <Button type="button" onClick={addSize} variant="outline">
                    Додати
                  </Button>
                </div>
                <div className="space-y-1">
                  {sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                    >
                      <span>
                        Розмір: {size.size} - {size.stock} шт.
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Кольори *
              </label>
              <Input
                placeholder="Чорний, Білий, Синій"
                {...registerProduct("colors", { required: "Введіть кольори" })}
                error={getErrorMessage(productErrors.colors)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Введіть кольори через кому
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Загальна кількість *"
              type="number"
              {...registerProduct("stock", {
                required: "Введіть кількість",
                min: { value: 0, message: "Кількість не може бути відʼємною" },
              })}
              error={getErrorMessage(productErrors.stock)}
            />
            <Input 
              label="Матеріал" 
              {...registerProduct("material")} 
            />
            <Input
              label="Особливості"
              placeholder="Водонепроникні, Легкі, Для бігу"
              {...registerProduct("features")}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Зображення товару (до 5 файлів)
              </label>
              <div className="mt-1 flex items-center">
                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span>Вибрати файли</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {productImages.length} файлів обрано
                </span>
              </div>

              {/* Попередній перегляд зображень */}
              {productImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {productImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddProductModal(false);
                setSelectedProduct(null);
                resetProduct();
                setProductImages([]);
                setSizes([]);
              }}
            >
              Скасувати
            </Button>
            <Button type="submit">
              {selectedProduct ? "Оновити товар" : "Додати товар"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};