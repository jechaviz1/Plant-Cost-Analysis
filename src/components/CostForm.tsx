import React, { useState } from 'react';
import { Plus, Minus, Factory } from 'lucide-react';
import type { Plant, Cost, Product } from '../types';

interface CostFormProps {
  config: Plant;
  onChange: (config: Partial<Plant>) => void;
  products: Product[];
}

export function CostForm({ config, onChange, products }: CostFormProps) {
  const [lastAddedCostId, setLastAddedCostId] = useState<string | null>(null);

  const addCost = (type: Cost['type']) => {
    try {
      const newCost: Cost = {
        id: crypto.randomUUID(),
        name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Cost`,
        type,
        allocationType: 'plant-wide',
        ...(type === 'fixed' && { amount: 0 }),
        ...(type === 'variable' && { costPerUnit: 0 }),
        ...(type === 'semi-variable' && { baseUnits: 0, baseCost: 0, scaleFactor: 1 })
      };

      onChange({
        costs: [...config.costs, newCost]
      });

      setLastAddedCostId(newCost.id);
    } catch (error) {
      console.error('Error adding cost:', error);
    }
  };

  const updateCost = (costId: string, updates: Partial<Cost>) => {
    onChange({
      costs: config.costs.map(c =>
        c.id === costId ? { ...c, ...updates } : c
      )
    });
  };

  const removeCost = (costId: string) => {
    onChange({
      costs: config.costs.filter(c => c.id !== costId)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-lg text-white">
        <Factory className="w-6 h-6" />
        <h2 className="text-xl font-bold">Cost Configuration</h2>
      </div>

      <div className="flex justify-end space-x-2">
        {(['fixed', 'variable', 'semi-variable', 'step-function'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => addCost(type)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Cost
          </button>
        ))}
      </div>

      {config.costs.map((cost) => (
        <div key={cost.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={cost.name}
              onChange={(e) => updateCost(cost.id, { name: e.target.value })}
              className="text-lg font-medium bg-transparent border-none focus:ring-0 p-0"
              placeholder="Cost Name"
              autoFocus={cost.id === lastAddedCostId}
            />
            <button
              type="button"
              onClick={() => removeCost(cost.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Type
              </label>
              <select
                value={cost.type}
                onChange={(e) => updateCost(cost.id, { type: e.target.value as Cost['type'] })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="fixed">Fixed Cost</option>
                <option value="variable">Variable Cost</option>
                <option value="semi-variable">Semi-Variable Cost</option>
                <option value="step-function">Step Function Cost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Allocation
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="plant-wide"
                    checked={cost.allocationType === 'plant-wide'}
                    onChange={() => updateCost(cost.id, { 
                      allocationType: 'plant-wide',
                      specificToProduct: undefined
                    })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Plant-wide cost</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="product-specific"
                    checked={cost.allocationType === 'product-specific'}
                    onChange={() => updateCost(cost.id, { 
                      allocationType: 'product-specific',
                      specificToProduct: products[0]?.id
                    })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Product-specific cost</span>
                </label>
              </div>
            </div>

            {cost.allocationType === 'product-specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific to Product
                </label>
                <select
                  value={cost.specificToProduct || ''}
                  onChange={(e) => updateCost(cost.id, { specificToProduct: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {cost.type === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fixed Amount ($)
                </label>
                <input
                  type="number"
                  value={cost.amount || 0}
                  onChange={(e) => updateCost(cost.id, { amount: parseFloat(e.target.value) || 0 })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            )}

            {cost.type === 'variable' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost per {config.unitType} ($)
                </label>
                <input
                  type="number"
                  value={cost.costPerUnit || 0}
                  onChange={(e) => updateCost(cost.id, { costPerUnit: parseFloat(e.target.value) || 0 })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            )}

            {cost.type === 'semi-variable' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base {config.unitType}s
                  </label>
                  <input
                    type="number"
                    value={cost.baseUnits || 0}
                    onChange={(e) => updateCost(cost.id, { baseUnits: parseFloat(e.target.value) || 0 })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Cost ($)
                  </label>
                  <input
                    type="number"
                    value={cost.baseCost || 0}
                    onChange={(e) => updateCost(cost.id, { baseCost: parseFloat(e.target.value) || 0 })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale Factor
                  </label>
                  <input
                    type="number"
                    value={cost.scaleFactor || 1}
                    onChange={(e) => updateCost(cost.id, { scaleFactor: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {cost.type === 'step-function' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Type
                  </label>
                  <select
                    value={cost.stepType || 'fixed'}
                    onChange={(e) => updateCost(cost.id, { stepType: e.target.value as 'fixed' | 'variable' })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="fixed">Fixed Cost Steps</option>
                    <option value="variable">Variable Cost Steps</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Step Points
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const ranges = [...(cost.ranges || [])];
                        const lastRange = ranges[ranges.length - 1];
                        ranges.push({
                          id: crypto.randomUUID(),
                          startUnits: lastRange ? lastRange.endUnits : 0,
                          endUnits: lastRange ? lastRange.endUnits + 1000 : 1000,
                          ...(cost.stepType === 'fixed' 
                            ? { fixedCost: 0 }
                            : { costPerUnit: 0 }
                          )
                        });
                        updateCost(cost.id, { ranges });
                      }}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(cost.ranges || []).map((range, index) => (
                      <div key={range.id} className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          {range.startUnits.toLocaleString()} - {range.endUnits.toLocaleString()} {config.unitType}s
                        </div>
                        <input
                          type="number"
                          value={cost.stepType === 'fixed' ? range.fixedCost : range.costPerUnit}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const ranges = [...(cost.ranges || [])];
                            ranges[index] = {
                              ...range,
                              ...(cost.stepType === 'fixed'
                                ? { fixedCost: value }
                                : { costPerUnit: value }
                              )
                            };
                            updateCost(cost.id, { ranges });
                          }}
                          placeholder={cost.stepType === 'fixed' ? "Fixed cost" : "Cost per unit"}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const ranges = (cost.ranges || []).filter(r => r.id !== range.id);
                            updateCost(cost.id, { ranges });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}