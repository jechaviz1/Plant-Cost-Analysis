import React, { useState } from 'react';
import { Plus, Minus, Package } from 'lucide-react';
import type { Product } from '../types';

interface ProductManagementProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

export function ProductManagement({ products, onChange }: ProductManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: 'New Product',
      price: 0,
      demand: 0
    };
    onChange([...products, newProduct]);
    setEditingId(newProduct.id);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    onChange(products.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const removeProduct = (id: string) => {
    onChange(products.filter(p => p.id !== id));
  };

  const formatNumber = (value: number) => value.toLocaleString();
  const parseNumber = (value: string) => parseFloat(value.replace(/,/g, '')) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="w-6 h-6 mr-2" />
          Products
        </h2>
        <button
          onClick={addProduct}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-sm rounded-lg border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                className="text-lg font-medium bg-transparent border-none focus:ring-0 p-0"
                placeholder="Product Name"
                autoFocus={product.id === editingId}
              />
              <button
                onClick={() => removeProduct(product.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="text"
                  value={formatNumber(product.price)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, '');
                    updateProduct(product.id, { price: parseNumber(value) });
                  }}
                  className="c-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Demand (Units)
                </label>
                <input
                  type="text"
                  value={formatNumber(product.demand)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    updateProduct(product.id, { demand: parseNumber(value) });
                  }}
                  className="c-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Production
                </label>
                <input
                  type="text"
                  value={formatNumber(product.minProduction || 0)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    updateProduct(product.id, { minProduction: parseNumber(value) });
                  }}
                  className="c-input"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}