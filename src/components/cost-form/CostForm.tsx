import { useState } from 'react';
import { Plus, Minus, Factory, Info } from 'lucide-react';
import { AllocationTypeSelect } from './AllocationTypeSelect';
import { ProductSpecificSelect } from './ProductSpecificSelect';
import { FixedCostInput } from './FixedCostInput';
import { VariableCostInput } from './VariableCostInput';
import { SemiVariableCostInputs } from './SemiVariableCostInputs';
import { StepFunctionInputs } from './StepFunctionInputs';
import type { Plant, Cost, Product } from '../../types';

const COST_TYPE_EXPLANATIONS = {
  fixed: "A fixed cost remains constant regardless of production volume. Examples include rent, insurance, or equipment leases.",
  variable: "A variable cost changes directly with production volume, calculated on a per-unit basis. Examples include raw materials or direct labor.",
  'semi-variable': "A semi-variable cost has both fixed and variable components, scaling with production but not proportionally. Examples include utilities or maintenance.",
  'step-function': "A step function cost changes at specific production levels, either as fixed amounts or per-unit costs. Examples include additional equipment or labor shifts."
};

interface CostFormProps {
  config: Plant;
  onChange: (config: Partial<Plant>) => void;
  products: Product[];
}

export function CostForm({ config, onChange, products }: CostFormProps) {
  const [lastAddedCostId, setLastAddedCostId] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<Cost['type'] | null>(null);

  const addCost = (type: Cost['type']) => {
    try {
      const newCost: Cost = {
        id: crypto.randomUUID(),
        name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Cost`,
        type,
        allocationType: 'plant-wide',
        ...(type === 'fixed' && { amount: 0 }),
        ...(type === 'variable' && { costPerUnit: 0, productSpecificRates: [] }),
        ...(type === 'semi-variable' && { baseUnits: 0, baseCost: 0, scaleFactor: 1 }),
        ...(type === 'step-function' && { ranges: [], stepType: 'fixed' })
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

      <div className="grid grid-cols-2 gap-4">
        {(['fixed', 'variable', 'semi-variable', 'step-function'] as const).map(type => (
          <div
            key={type}
            className="relative"
            onMouseEnter={() => setHoveredType(type)}
            onMouseLeave={() => setHoveredType(null)}
          >
            <button
              type="button"
              onClick={() => addCost(type)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Cost
              <Info className="w-4 h-4 ml-2" />
            </button>
            {hoveredType === type && (
              <div className="absolute z-10 mt-2 w-64 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                {COST_TYPE_EXPLANATIONS[type]}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>

      {config.costs.map((cost) => (
        <div key={cost.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <input
                type="text"
                value={cost.name}
                onChange={(e) => updateCost(cost.id, { name: e.target.value })}
                className="text-lg font-medium bg-transparent border-none focus:ring-0 p-0"
                placeholder="Cost Name"
                autoFocus={cost.id === lastAddedCostId}
              />
              <div className="text-sm text-gray-500">
                {cost.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Cost
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeCost(cost.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <AllocationTypeSelect
              value={cost.allocationType}
              onChange={(allocationType) => updateCost(cost.id, {
                allocationType,
                specificToProduct: allocationType === 'product-specific' ? products[0]?.id : undefined,
                productSpecificRates: allocationType === 'product-specific' ? [] : undefined
              })}
            />

            {cost.allocationType === 'product-specific' && cost.type !== 'variable' && (
              <ProductSpecificSelect
                products={products}
                selectedProductId={cost.specificToProduct}
                onChange={(productId) => updateCost(cost.id, { specificToProduct: productId })}
              />
            )}

            {cost.type === 'fixed' && (
              <FixedCostInput
                value={cost.amount || 0}
                onChange={(amount) => updateCost(cost.id, { amount })}
              />
            )}

            {cost.type === 'variable' && (
              <VariableCostInput
                value={cost.costPerUnit || 0}
                unitType={(config.settings?.unitType === 'other' ? config.settings?.customUnitType : config.settings?.unitType) || 'unit'}
                onChange={(costPerUnit) => updateCost(cost.id, { costPerUnit })}
                products={products}
                productRates={cost.productSpecificRates}
                onProductRatesChange={
                  (rates) => updateCost(cost.id, { productSpecificRates: rates })
                }
                isProductSpecific={cost.allocationType === 'product-specific'}
              />
            )}

            {cost.type === 'semi-variable' && (
              <SemiVariableCostInputs
                baseUnits={cost.baseUnits || 0}
                baseCost={cost.baseCost || 0}
                scaleFactor={cost.scaleFactor || 1}
                unitType={config.settings?.unitType === 'other' ? config.settings?.customUnitType || 'unit' : config.settings?.unitType || 'unit'}
                onChange={(updates) => updateCost(cost.id, updates)}
              />
            )}

            {cost.type === 'step-function' && (
              <StepFunctionInputs
                ranges={cost.ranges || []}
                stepType={cost.stepType || 'fixed'}
                unitType={config.settings?.unitType === 'other' ? config.settings?.customUnitType || 'unit' : config.settings?.unitType || 'unit'}
                products={products}
                productRates={cost.productRangeRates}
                onProductRatesChange={
                  (rates) => updateCost(cost.id, { productRangeRates: rates })
                }
                isProductSpecific={cost.allocationType === 'product-specific'}
                onChange={(ranges) => updateCost(cost.id, { ranges })}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}