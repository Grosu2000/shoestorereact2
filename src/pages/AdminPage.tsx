import React, { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { adminApi } from "../services/admin.api";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useProductStore } from "../stores/product-store";

type TabType = "dashboard" | "orders" | "products" | "reviews";

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  brand: string;
  material?: string;
  features?: string;
}

const getErrorMessage = (error: any): string | undefined => {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (error.message) return String(error.message);
  return "Помилка";
};

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    Чорний: "#000000",
    Білий: "#FFFFFF",
    Сірий: "#808080",
    Синій: "#0000FF",
    Червоний: "#FF0000",
    Зелений: "#00FF00",
    Жовтий: "#FFFF00",
    Коричневий: "#A52A2A",
    Бежевий: "#F5F5DC",
    Рожевий: "#FFC0CB",
    Фіолетовий: "#800080",
  };
  return colorMap[colorName] || "#D8E2EB";
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { fetchProducts: fetchZustandProducts } = useProductStore();

  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProduct,
    formState: { errors: productErrors },
  } = useForm<ProductFormData>();

  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Нова структура: розміри, кольори та матриця
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizeColorMatrix, setSizeColorMatrix] = useState<
    Record<string, Record<string, number>>
  >({});
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  const refreshAllData = async () => {
    await fetchDashboardData();
    await queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === "products",
    });
    await queryClient.refetchQueries({
      predicate: (query) => query.queryKey[0] === "products",
    });
    await fetchZustandProducts();
    localStorage.setItem("products-updated", Date.now().toString());
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await adminApi.getStats();
      setStats(statsResponse.stats);
      const ordersResponse = await adminApi.getAllOrders();
      setOrders(ordersResponse.orders || []);
      const productsResponse = await adminApi.getAllProducts();
      setProducts(productsResponse.products || []);
    } catch (err: any) {
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
      showToast("Помилка оновлення статусу", "error");
    }
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setSizeColorMatrix((prev) => ({ ...prev, [newSize]: {} }));
      setNewSize("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
    const newMatrix = { ...sizeColorMatrix };
    delete newMatrix[size];
    setSizeColorMatrix(newMatrix);
  };

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
    const newMatrix = { ...sizeColorMatrix };
    Object.keys(newMatrix).forEach((size) => {
      delete newMatrix[size][color];
    });
    setSizeColorMatrix(newMatrix);
  };

  const updateStock = (size: string, color: string, stock: number) => {
    setSizeColorMatrix((prev) => ({
      ...prev,
      [size]: {
        ...prev[size],
        [color]: Math.max(0, stock),
      },
    }));
  };

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof ProductFormData];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      formData.append("sizeColorMatrix", JSON.stringify(sizeColorMatrix));
      productImages.forEach((file) => formData.append("images", file));

      if (selectedProduct) {
        await adminApi.updateProduct(selectedProduct.id, formData);
        showToast("Товар успішно оновлено", "success");
      } else {
        await adminApi.createProduct(formData);
        showToast("Товар успішно додано", "success");
      }

      setShowAddProductModal(false);
      resetProduct();
      setProductImages([]);
      setExistingImages([]);
      setSizes([]);
      setColors([]);
      setSizeColorMatrix({});
      setSelectedProduct(null);
      await refreshAllData();
    } catch (err: any) {
      showToast(`Помилка: ${err.message || "Невідома помилка"}`, "error");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей товар?")) return;
    try {
      await adminApi.deleteProduct(productId);
      showToast("Товар видалено", "success");
      await refreshAllData();
    } catch (err: any) {
      showToast("Помилка видалення товару", "error");
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    resetProduct({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      brand: product.brand,
      material: product.material || "",
      features: Array.isArray(product.features)
        ? product.features.join(", ")
        : product.features || "",
    });
    setSizes(product.sizes || []);
    setColors(product.colors || []);
    setSizeColorMatrix(product.sizeColorMatrix || {});
    setExistingImages(product.images || []);
    setProductImages([]);
    setShowAddProductModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setProductImages((prev) => [...prev, ...Array.from(files)]);
  };

  const removeExistingImage = async (imageUrl: string) => {
    if (!selectedProduct) return;
    try {
      await adminApi.deleteProductImage(selectedProduct.id, imageUrl);
      setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
      showToast("Зображення видалено", "success");
    } catch (err) {
      showToast("Помилка видалення зображення", "error");
    }
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-accent sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "reviews" ? "bg-button text-text" : "text-text/70 hover:bg-accent"}`}
              >
                💬 Відгуки
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "dashboard" ? "bg-button text-text" : "text-text/70 hover:bg-accent"}`}
              >
                📊 Дашборд
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "orders" ? "bg-button text-text" : "text-text/70 hover:bg-accent"}`}
              >
                📦 Замовлення
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "products" ? "bg-button text-text" : "text-text/70 hover:bg-accent"}`}
              >
                👟 Товари
              </button>
            </div>
            {activeTab === "products" && (
              <Button onClick={() => setShowAddProductModal(true)} size="sm">
                + Додати товар
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Всього замовлень</p>
                  <p className="text-3xl font-bold text-text mt-1">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-button/20 rounded-full flex items-center justify-center">
                  📦
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Загальний дохід</p>
                  <p className="text-3xl font-bold text-text mt-1">
                    {stats.totalRevenue?.toFixed(0) || 0} грн
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  💰
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Товарів</p>
                  <p className="text-3xl font-bold text-text mt-1">
                    {stats.totalProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  👟
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Користувачів</p>
                  <p className="text-3xl font-bold text-text mt-1">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  👤
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-soft border border-accent overflow-hidden">
            <div className="px-6 py-4 border-b border-accent">
              <h2 className="text-xl font-semibold text-text">
                Всі замовлення ({orders.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-accent">
                <thead className="bg-accent/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text/70">
                      Номер
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text/70">
                      Клієнт
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text/70">
                      Сума
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text/70">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text/70">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text/70">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-accent/10 transition border-b border-accent"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-text">
                        #{order.orderNumber?.slice(-8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text">
                          {order.shippingInfo?.firstName}{" "}
                          {order.shippingInfo?.lastName}
                        </div>
                        <div className="text-xs text-text/50">
                          {order.shippingInfo?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-text">
                        {order.total?.toFixed(0)} грн
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : order.status === "PROCESSING" ? "bg-blue-100 text-blue-800" : order.status === "SHIPPED" ? "bg-purple-100 text-purple-800" : order.status === "DELIVERED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
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
                      <td className="px-6 py-4 text-sm text-text/50">
                        {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
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
                                className="text-error border-error/30"
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

        {activeTab === "products" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-soft border border-accent overflow-hidden hover:shadow-md transition"
              >
                <div className="h-48 bg-accent/30">
                  <img
                    src={
                      product.images?.[0]
                        ? product.images[0].startsWith("http")
                          ? product.images[0]
                          : `http://localhost:3000${product.images[0]}`
                        : "/images/placeholder.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-text">
                        {product.name}
                      </h3>
                      <p className="text-sm text-text/50">
                        {product.brand} • {product.category}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {product.inStock ? `${product.stock} шт` : "Немає"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xl font-bold text-text">
                      {product.price} грн
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                      >
                        Редагувати
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-error border-error/30"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Видалити
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setSelectedProduct(null);
          resetProduct();
          setProductImages([]);
          setExistingImages([]);
          setSizes([]);
          setColors([]);
          setSizeColorMatrix({});
        }}
        title={selectedProduct ? "Редагувати товар" : "Додати новий товар"}
      >
        <form
          onSubmit={handleSubmitProduct(handleAddProduct)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Назва товару *
              </label>
              <Input
                {...registerProduct("name", { required: "Введіть назву" })}
                error={getErrorMessage(productErrors.name)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ціна (грн) *
              </label>
              <Input
                type="number"
                step="0.01"
                {...registerProduct("price", {
                  required: "Введіть ціну",
                  min: { value: 0, message: "Ціна не може бути відʼємною" },
                })}
                error={getErrorMessage(productErrors.price)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бренд *
              </label>
              <Input
                {...registerProduct("brand", { required: "Введіть бренд" })}
                error={getErrorMessage(productErrors.brand)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категорія *
              </label>
              <Input
                {...registerProduct("category", {
                  required: "Введіть категорію",
                })}
                error={getErrorMessage(productErrors.category)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Опис товару *
            </label>
            <textarea
              {...registerProduct("description", { required: "Введіть опис" })}
              className="w-full px-3 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-button"
              rows={3}
            />
            {productErrors.description && (
              <p className="mt-1 text-sm text-error">
                {getErrorMessage(productErrors.description)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-accent/10 rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📏 Розміри
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Розмір (42)"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addSize} variant="outline">
                  Додати
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <div
                    key={size}
                    className="bg-white rounded-lg px-3 py-1 border border-accent flex items-center gap-2"
                  >
                    <span className="font-medium">{size}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-error hover:text-error-dark"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/10 rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🎨 Кольори
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Колір (Чорний)"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addColor} variant="outline">
                  Додати
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className="bg-white rounded-lg px-3 py-1 border border-accent flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-error hover:text-error-dark"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {sizes.length > 0 && colors.length > 0 && (
            <div className="bg-accent/10 rounded-xl p-4 overflow-x-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📊 Кількість товару (розмір × колір)
              </label>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Розмір \\ Колір</th>
                    {colors.map((color) => (
                      <th key={color} className="p-2 text-center min-w-[80px]">
                        {color}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size}>
                      <td className="p-2 font-medium border-t border-accent">
                        {size}
                      </td>
                      {colors.map((color) => (
                        <td
                          key={color}
                          className="p-2 text-center border-t border-accent"
                        >
                          <input
                            type="number"
                            min="0"
                            value={sizeColorMatrix[size]?.[color] || 0}
                            onChange={(e) =>
                              updateStock(
                                size,
                                color,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20 px-2 py-1 border border-accent rounded text-center"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-text/50 mt-3">
                💡 Заповніть кількість для кожної комбінації розміру та кольору
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Матеріал
              </label>
              <Input {...registerProduct("material")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Особливості
              </label>
              <Input
                placeholder="Водонепроникні, Легкі"
                {...registerProduct("features")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🖼️ Зображення товару
            </label>
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-text/60 mb-2">Поточні зображення:</p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={`http://localhost:3000${img}`}
                        alt="product"
                        className="w-20 h-20 object-cover rounded-lg border border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-button text-text px-4 py-2 rounded-lg hover:bg-button-hover transition">
                <span>📁 Вибрати файли</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-text/50">
                {productImages.length} нових файлів
              </span>
            </div>
            {productImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {productImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddProductModal(false);
                setSelectedProduct(null);
                resetProduct();
                setProductImages([]);
                setExistingImages([]);
                setSizes([]);
                setColors([]);
                setSizeColorMatrix({});
              }}
            >
              Скасувати
            </Button>
            <Button type="submit">
              {selectedProduct ? "💾 Оновити товар" : "➕ Додати товар"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
