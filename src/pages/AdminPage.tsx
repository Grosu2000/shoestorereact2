import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { mockProducts } from '../utils/constants';
import type { Product, ProductSize } from '../types/product';

export const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    brand: '',
    sizes: [{ size: '', stock: 0 }],
    colors: [],
    stockQuantity: 0,
    material: '',
    country: ''
  });

  const [sizeInput, setSizeInput] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name || '',
      price: newProduct.price || 0,
      originalPrice: newProduct.originalPrice,
      image: newProduct.image || '/images/placeholder.jpg',
      images: newProduct.images || ['/images/placeholder.jpg'],
      description: newProduct.description || '',
      category: newProduct.category || '',
      brand: newProduct.brand || '',
      sizes: newProduct.sizes || [],
      colors: newProduct.colors || [],
      inStock: (newProduct.stockQuantity || 0) > 0,
      stockQuantity: newProduct.stockQuantity || 0,
      rating: 0,
      reviewCount: 0,
      features: newProduct.features || [],
      material: newProduct.material || '',
      releaseYear: new Date().getFullYear(),
      country: newProduct.country || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: '',
      price: 0,
      description: '',
      category: '',
      brand: '',
      sizes: [{ size: '', stock: 0 }],
      colors: [],
      stockQuantity: 0,
      material: '',
      country: ''
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Видалити цей товар?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts(prev => prev.map(p => 
      p.id === editingProduct.id 
        ? { ...p, ...newProduct, inStock: (newProduct.stockQuantity || 0) > 0 }
        : p
    ));
    setEditingProduct(null);
    setNewProduct({
      name: '',
      price: 0,
      description: '',
      category: '',
      brand: '',
      sizes: [{ size: '', stock: 0 }],
      colors: [],
      stockQuantity: 0,
      material: '',
      country: ''
    });
  };

  const addSize = () => {
    if (!sizeInput.trim()) return;
    
    const sizes = sizeInput.split(',').map(s => ({
      size: s.trim(),
      stock: 0
    }));

    setNewProduct(prev => ({
      ...prev,
      sizes: [...(prev.sizes || []), ...sizes]
    }));
    setSizeInput('');
  };

  const updateSizeStock = (index: number, stock: number) => {
    const updatedSizes = [...(newProduct.sizes || [])];
    updatedSizes[index] = { ...updatedSizes[index], stock };
    
    setNewProduct(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  const removeSize = (index: number) => {
    const updatedSizes = [...(newProduct.sizes || [])];
    updatedSizes.splice(index, 1);
    
    setNewProduct(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  const totalStock = (newProduct.sizes || []).reduce((sum, size) => sum + size.stock, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Адмін панель</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Редагувати товар' : 'Додати новий товар'}
            </h2>
            
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
              <Input
                label="Назва товару"
                value={newProduct.name || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ціна (грн)"
                  type="number"
                  value={newProduct.price || 0}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                />
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm font-medium text-gray-700">Загальна кількість:</div>
                  <div className="text-lg font-bold">{totalStock} шт.</div>
                </div>
              </div>

              <Input
                label="Бренд"
                value={newProduct.brand || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                required
              />

              <Input
                label="Категорія"
                value={newProduct.category || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                required
              />

              {/* Управління розмірами */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Розміри та запаси
                </label>
                <div className="space-y-2 mb-3">
                  {(newProduct.sizes || []).map((sizeInfo, index) => (
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
                value={newProduct.material || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, material: e.target.value }))}
                required
              />

              <Input
                label="Країна виробник"
                value={newProduct.country || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, country: e.target.value }))}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Кольори (через кому)</label>
                <Input
                  value={newProduct.colors?.join(', ') || ''}
                  onChange={(e) => setNewProduct(prev => ({ 
                    ...prev, 
                    colors: e.target.value.split(',').map(c => c.trim()) 
                  }))}
                  placeholder="Чорний, Білий, Сірий"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                <textarea
                  value={newProduct.description || ''}
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
                      setNewProduct({
                        name: '',
                        price: 0,
                        description: '',
                        category: '',
                        brand: '',
                        sizes: [{ size: '', stock: 0 }],
                        colors: [],
                        stockQuantity: 0,
                        material: '',
                        country: ''
                      });
                    }}
                  >
                    Скасувати
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Список товарів ({products.length})</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand} • {product.category}</p>
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
                      {product.sizes.map(sizeInfo => (
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
          </div>
        </div>
      </div>
    </div>
  );
};