import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { mockProducts } from '../utils/constants';
import type { Product } from '../types/product';

export const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    brand: '',
    sizes: [],
    colors: [],
    stockQuantity: 0,
    material: '',
    country: ''
  });

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
      sizes: [],
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
      sizes: [],
      colors: [],
      stockQuantity: 0,
      material: '',
      country: ''
    });
  };

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
                <Input
                  label="Кількість на складі"
                  type="number"
                  value={newProduct.stockQuantity || 0}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                  required
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Розміри (через кому)</label>
                <Input
                  value={newProduct.sizes?.join(', ') || ''}
                  onChange={(e) => setNewProduct(prev => ({ 
                    ...prev, 
                    sizes: e.target.value.split(',').map(s => s.trim()) 
                  }))}
                  placeholder="39, 40, 41, 42"
                />
              </div>

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
                        sizes: [],
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand} • {product.category}</p>
                      <p className="text-sm">{product.price} грн • {product.stockQuantity} шт.</p>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};