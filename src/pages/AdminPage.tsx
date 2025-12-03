import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/auth-store';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types/product';

interface ProductFormData {
  name: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  sizes: Array<{ size: string; stock: number }>;
  colors: string[];
  material: string;
  country: string;
  images?: string[];
}

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: '',
    price: 0,
    description: '',
    category: '',
    brand: '',
    sizes: [{ size: '', stock: 0 }],
    colors: [],
    material: '',
    country: '',
    images: ['/images/placeholder.jpg']
  });

  const [sizeInput, setSizeInput] = useState('');

if (!user || user.role.toUpperCase() !== 'ADMIN') {
  return <Navigate to="/" replace />;
}

  // Завантаження товарів
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
  console.log('AdminPage: current products state:', products);
}, [products]);

   const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Admin: fetching products...');
    
    const response = await api.get<Product[] | { data: Product[] }>('/products');
    
    console.log('Admin API response:', response);
    console.log('Is array?', Array.isArray(response));
    
    // Варіант 1: якщо API повертає масив
    if (Array.isArray(response)) {
      console.log('Setting products (array):', response.length);
      setProducts(response);
    }
    // Варіант 2: якщо API повертає { data: [] }
    else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
      console.log('Setting products (response.data):', (response as any).data.length);
      setProducts((response as any).data);
    }
    // Варіант 3: якщо щось інше
    else {
      console.log('Unknown format, setting empty array');
      setProducts([]);
    }
    
  } catch (error: any) {
    console.error('Error fetching products:', error);
    setError(error.message || 'Помилка завантаження товарів');
  } finally {
    setLoading(false);
  }
};

  // Додати товар
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      const productData = {
        ...newProduct,
        stock: newProduct.sizes.reduce((sum, size) => sum + size.stock, 0),
        inStock: newProduct.sizes.some(size => size.stock > 0)
      };

      const response = await api.post<{ data: Product }>('/products', productData);
      
      setProducts(prev => [...prev, response.data]);
      resetForm();
      alert('Товар успішно додано!');
    } catch (error: any) {
      console.error('Error adding product:', error);
      setError(error.message || 'Помилка додавання товару');
    }
  };

  // Видалити товар
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Видалити цей товар?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Товар успішно видалено!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.message || 'Помилка видалення товару');
    }
  };

  // Редагувати товар
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      brand: product.brand,
      sizes: product.sizes || [],
      colors: product.colors || [],
      material: product.material || '',
      country: product.country || '',
      images: product.images
    });
  };

  // Оновити товар
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setError(null);
      
      const productData = {
        ...newProduct,
        stock: newProduct.sizes.reduce((sum, size) => sum + size.stock, 0),
        inStock: newProduct.sizes.some(size => size.stock > 0)
      };

      const response = await api.put<{ data: Product }>(`/products/${editingProduct.id}`, productData);
      
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? response.data : p
      ));
      
      setEditingProduct(null);
      resetForm();
      alert('Товар успішно оновлено!');
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.message || 'Помилка оновлення товару');
    }
  };

  // Скинути форму
  const resetForm = () => {
    setNewProduct({
      name: '',
      price: 0,
      description: '',
      category: '',
      brand: '',
      sizes: [{ size: '', stock: 0 }],
      colors: [],
      material: '',
      country: '',
      images: ['/images/placeholder.jpg']
    });
    setSizeInput('');
  };

  // Додати розмір
  const addSize = () => {
    if (!sizeInput.trim()) return;
    
    const sizes = sizeInput.split(',').map(s => ({
      size: s.trim(),
      stock: 0
    }));

    setNewProduct(prev => ({
      ...prev,
      sizes: [...prev.sizes, ...sizes]
    }));
    setSizeInput('');
  };

  // Оновити запас розміру
  const updateSizeStock = (index: number, stock: number) => {
    const updatedSizes = [...newProduct.sizes];
    updatedSizes[index] = { ...updatedSizes[index], stock };
    
    setNewProduct(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  // Видалити розмір
  const removeSize = (index: number) => {
    const updatedSizes = [...newProduct.sizes];
    updatedSizes.splice(index, 1);
    
    setNewProduct(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  const totalStock = newProduct.sizes.reduce((sum, size) => sum + size.stock, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Адмін панель</h1>
        <p className="text-gray-600 mb-8">Ви увійшли як: <span className="font-semibold">{user.email}</span></p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Редагувати товар' : 'Додати новий товар'}
            </h2>
            
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
              <Input
                label="Назва товару"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ціна (грн)"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                  min="0"
                  step="0.01"
                />
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm font-medium text-gray-700">Загальна кількість:</div>
                  <div className="text-lg font-bold">{totalStock} шт.</div>
                </div>
              </div>

              <Input
                label="Бренд"
                value={newProduct.brand}
                onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                required
              />

              <Input
                label="Категорія"
                value={newProduct.category}
                onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                required
              />

              {/* Управління розмірами */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Розміри та запаси
                </label>
                <div className="space-y-2 mb-3">
                  {newProduct.sizes.map((sizeInfo, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-12 font-medium">{sizeInfo.size}</span>
                      <Input
                        type="number"
                        value={sizeInfo.stock}
                        onChange={(e) => updateSizeStock(index, Number(e.target.value))}
                        className="flex-1"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Додати розміри (через кому): 39, 40, 41"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSize}>
                    Додати
                  </Button>
                </div>
              </div>

              <Input
                label="Матеріал"
                value={newProduct.material}
                onChange={(e) => setNewProduct(prev => ({ ...prev, material: e.target.value }))}
              />

              <Input
                label="Країна виробник"
                value={newProduct.country}
                onChange={(e) => setNewProduct(prev => ({ ...prev, country: e.target.value }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Кольори (через кому)
                </label>
                <Input
                  value={newProduct.colors.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({ 
                    ...prev, 
                    colors: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                  }))}
                  placeholder="Чорний, Білий, Сірий"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Опис
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Оновити товар' : 'Додати товар'}
                </Button>
                {editingProduct && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingProduct(null);
                      resetForm();
                    }}
                  >
                    Скасувати
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Список товарів */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Список товарів ({products.length})
            </h2>
            
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Товари відсутні
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {product.brand} • {product.category}
                        </p>
                        <p className="text-sm">{product.price} грн</p>
                      </div>
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
                          variant="danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Видалити
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium mb-1">Розміри та запаси:</div>
                      <div className="flex flex-wrap gap-2">
                        {(product.sizes || []).map(sizeInfo => (
                          <span 
                            key={sizeInfo.size}
                            className={`px-2 py-1 rounded text-xs ${
                              sizeInfo.stock > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {sizeInfo.size}: {sizeInfo.stock} шт.
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};