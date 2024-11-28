import React from 'react';
import { Plus, Minus, Package } from 'lucide-react';
import type { Plant, Product } from '../types';

interface PlantProductManagementProps {
  plant: Plant;
  products: Product[];
  onAddProduct: () => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onRemoveProduct: (productId: string) => void;
}

export function PlantProductManagement({
  plant,
  products,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct
}: PlantProductManagementProps) {
  const formatNumber = (value: number) => value.toLocaleString();
  const parseNumber = (value: string) => parseFloat(value.replace(/,/g, '')) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Products</h3>
        </div>
        <button
          onClick={onAddProduct}
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
                onChange={(e) => onUpdateProduct(product.id, { name: e.target.value })}
                className="text-lg font-medium bg-transparent border-none focus:ring-0 p-0"
                placeholder="Product Name"
              />
              <button
                onClick={() => onRemoveProduct(product.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Price ($)
                </label>
                <input
                  type="number"
                  value={formatNumber(product.price)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, '');
                    onUpdateProduct(product.id, { price: parseNumber(value) });
                  }}
                  className="c-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Demand ({plant.settings?.unitType === 'other' ? plant.settings?.customUnitType || 'unit' : plant.settings?.unitType}s)
                </label>
                <input
                  type="number"
                  value={formatNumber(product.demand)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    onUpdateProduct(product.id, { demand: parseNumber(value) });
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