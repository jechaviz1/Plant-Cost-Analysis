import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { Plant, Product } from '../types';

interface Allocation {
  plantId: string;
  units: number;
  products: {
    [productId: string]: {
      units: number;
      revenue: number;
      cost: number;
      profit: number;
    };
  };
}

interface ProductionAdjustmentProps {
  plants: Plant[];
  products: Product[];
  allocations: Allocation[];
  onAllocationsChange: (allocations: Allocation[]) => void;
  onReset: () => void;
}

export function ProductionAdjustment({
  plants,
  products,
  allocations,
  onAllocationsChange,
  onReset
}: ProductionAdjustmentProps) {
  const formatNumber = (value: number) => value.toLocaleString();
  const parseNumber = (value: string) => parseInt(value.replace(/[^\d]/g, '')) || 0;

  const handleProductUnitsChange = (plantId: string, productId: string, value: string) => {
    const numValue = parseNumber(value);
    const newAllocations = allocations.map(a => {
      if (a.plantId !== plantId) return a;

      const newProducts = {
        ...a.products,
        [productId]: {
          ...a.products[productId],
          units: numValue
        }
      };

      return {
        ...a,
        units: Object.values(newProducts).reduce((sum, p) => sum + p.units, 0),
        products: newProducts
      };
    });

    onAllocationsChange(newAllocations);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Manual Production Adjustment</h3>
        <button
          onClick={onReset}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Optimal
        </button>
      </div>

      <div className="space-y-6">
        {allocations.map(({ plantId, products: productAllocations }) => {
          const plant = plants.find(p => p.id === plantId);
          if (!plant) return null;

          return (
            <div key={plantId} className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{plant.name}</h4>
              <div className="space-y-4">
                {products.map(product => {
                  const allocation = productAllocations[product.id] || { units: 0 };
                  const productConfig = plant.products[product.id];

                  if (!productConfig) return null;

                  return (
                    <div key={product.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {product.name}
                        </label>
                        <input
                          type="text"
                          value={formatNumber(allocation.units)}
                          onChange={(e) => handleProductUnitsChange(plantId, product.id, e.target.value)}
                          className="c-input"
                          placeholder={`Enter units (max: ${productConfig.capacity ? productConfig.capacity.toLocaleString() : 'N/A'})`}
                        />
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Maximum capacity: {productConfig?.capacity?.toLocaleString() || 'N/A'} units
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}