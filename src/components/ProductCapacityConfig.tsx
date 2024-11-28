import React from 'react';
import { Settings, Info } from 'lucide-react';
import { OperatingTimeConfig } from './OperatingTimeConfig';
import { ProductRateConfig } from './ProductRateConfig';
import type { Plant, Product } from '../types';

interface ProductCapacityConfigProps {
  plant: Plant;
  products: Product[];
  onChange: (updates: Partial<Plant>) => void;
}

const DEFAULT_OPERATING_TIME = {
  hoursPerDay: 8,
  daysPerWeek: 5,
  weeksPerYear: 50
};

export function ProductCapacityConfig({ plant, products, onChange }: ProductCapacityConfigProps) {
  // Set default capacity mode to 'rate' if not set
  React.useEffect(() => {
    if (!plant.capacityMode) {
      onChange({
        capacityMode: 'rate',
        operatingTime: DEFAULT_OPERATING_TIME
      });
    }
  }, []);

  const handleCapacityModeChange = (mode: 'fixed' | 'rate') => {
    onChange({
      capacityMode: mode,
      // Initialize operating time when switching to rate mode
      ...(mode === 'rate' && !plant.operatingTime && { 
        operatingTime: DEFAULT_OPERATING_TIME 
      }),
      // Reset operating time when switching to fixed mode
      ...(mode === 'fixed' && { 
        operatingTime: undefined 
      })
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Production Configuration</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="fixed"
                checked={plant.capacityMode === 'fixed'}
                onChange={() => handleCapacityModeChange('fixed')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Fixed Capacity</span>
              <Info className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <div className="hidden group-hover:block absolute z-10 mt-2 w-64 p-2 bg-gray-900 text-white text-sm rounded-lg">
              Set a fixed maximum capacity for the plant, regardless of operating time.
            </div>
          </div>
          <div className="relative group">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="rate"
                checked={plant.capacityMode === 'rate'}
                onChange={() => handleCapacityModeChange('rate')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Rate-Based</span>
              <Info className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <div className="hidden group-hover:block absolute z-10 mt-2 w-64 p-2 bg-gray-900 text-white text-sm rounded-lg">
              Calculate capacity based on production rate and operating time.
            </div>
          </div>
        </div>
      </div>

      {plant.capacityMode === 'fixed' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Capacity ({plant.unitType}s)
          </label>
          <input
            type="number"
            value={plant.capacity || 0}
            onChange={(e) => onChange({ capacity: parseFloat(e.target.value) || 0 })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      ) : (
        <>
          <OperatingTimeConfig plant={plant} onChange={onChange} />
          <div className="space-y-6">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">{product.name}</h4>
                <ProductRateConfig
                  plant={plant}
                  product={product}
                  onChange={(updates) => {
                    onChange({
                      products: {
                        ...plant.products,
                        [product.id]: {
                          ...plant.products[product.id],
                          ...updates
                        }
                      }
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}