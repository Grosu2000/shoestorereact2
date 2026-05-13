import React from 'react';
import { Link } from 'react-router-dom';
import { useCompareStore } from '../stores/compare-store';
import { Button } from '../components/ui/Button';
import { getFirstImage } from '../utils/imageHelpers';

export const ComparePage: React.FC = () => {
  const { items, removeItem, clearAll, getItemsCount } = useCompareStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 text-center py-16">
          <div className="text-6xl mb-4">⇄</div>
          <h1 className="text-2xl font-bold text-text mb-4">Немає товарів для порівняння</h1>
          <p className="text-text/60 mb-8">Додайте товари з каталогу, щоб порівняти їх характеристики</p>
          <Link to="/products">
            <Button size="lg">Перейти до товарів</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text">Порівняння товарів ({getItemsCount()}/4)</h1>
          <Button variant="outline" onClick={clearAll} size="sm">
            Очистити всі
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-soft border border-accent">
            <thead>
              <tr className="border-b border-accent">
                <th className="p-4 text-left text-text font-semibold w-48 bg-accent/20">Характеристика</th>
                {items.map((product) => (
                  <th key={product.id} className="p-4 text-center min-w-[220px]">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="float-right text-text/40 hover:text-error transition text-xl leading-none"
                      aria-label="Видалити"
                    >
                      ×
                    </button>
                    <img
                      src={getFirstImage(product.images)}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                    />
                    <h3 className="font-semibold text-text">{product.name}</h3>
                    <p className="text-sm text-text/60">{product.brand}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Ціна</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className="text-xl font-bold text-text">{product.price} грн</span>
                    {product.originalPrice && (
                      <span className="text-sm text-text/40 line-through ml-2">{product.originalPrice} грн</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Рейтинг</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="flex justify-center text-amber-500">
                      {'★'.repeat(Math.floor(product.rating || 0))}
                      {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                    </div>
                    <span className="text-sm text-text/60">({product.reviewCount || 0})</span>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Наявність</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className={product.inStock ? 'text-success font-medium' : 'text-error'}>
                      {product.inStock ? 'В наявності' : 'Немає'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Розміри</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {product.sizes?.filter(s => s.stock > 0).map(s => (
                        <span key={s.size} className="px-2 py-1 bg-accent/30 rounded text-sm">
                          {s.size}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Кольори</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {product.colors?.map(c => (
                        <span key={c} className="px-2 py-1 bg-accent/30 rounded text-sm">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Матеріал</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">{product.material || '—'}</td>
                ))}
              </tr>

              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Країна</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">{product.country || '—'}</td>
                ))}
              </tr>

              <tr className="border-b border-accent">
                <td className="p-4 font-medium text-text bg-accent/10">Опис</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-sm text-text/70 leading-relaxed">
                    {product.description?.length > 100 ? `${product.description.substring(0, 100)}...` : product.description}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-medium text-text bg-accent/10">Дія</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <Link to={`/product/${product.id}`}>
                      <Button size="sm" variant="outline">Детальніше</Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};