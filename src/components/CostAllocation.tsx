import React from 'react';
import { PieChart } from 'lucide-react';
import type { Cost, Product } from '../types';

interface CostAllocationProps {
  cost: Cost;
  products: Product[];
  onChange: (allocations: Cost['productAllocations']) => void;
}

export function CostAllocation({ cost, products, onChange }: CostAllocationProps) {
  const allocations = cost.productAllocations || {};
  const totalAllocation = Object.values(allocations).reduce((sum, value) => sum + value, 0);

  const handleAllocationChange = (productId: string, value: string) => {
    const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
    const newAllocations = {
      ...allocations,
      [productId]: numValue
    };

    // Remove allocation if it's 0
    if (numValue === 0) {
      delete newAllocations[productId];
    }

    onChange(newAllocations);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2 mb-2">
        <PieChart className="w-4 h-4 text-gray-500" />
        <h4 className="text-sm font-medium text-gray-700">Cost Allocation</h4>
      </div>

      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex items-center space-x-4">
            <div className="w-1/3">
              <label className="block text-sm text-gray-600">
                {product.name}
              </label>
            </div>
            <div className="w-2/3 flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                value={allocations[product.id] || ''}
                onChange={(e) => handleAllocationChange(product.id, e.target.value)}
                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
        ))}

        {totalAllocation > 100 && (
          <div className="text-sm text-red-600 mt-2">
            Total allocation exceeds 100%
          </div>
        )}
      </div>
    </div>
  );
}