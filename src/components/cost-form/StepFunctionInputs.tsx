import { Plus, Minus } from 'lucide-react';
import type { StepFunctionRange, Product, ProductSpecificRate } from '../../types';

interface StepFunctionInputsProps {
  ranges: StepFunctionRange[];
  stepType: 'fixed' | 'variable';
  unitType: string;
  products: Product[];
  productRates?: ProductSpecificRate[];
  onProductRatesChange?: (rates: ProductSpecificRate[]) => void;
  isProductSpecific?: boolean;
  onChange: (ranges: StepFunctionRange[]) => void;
}

export function StepFunctionInputs({
  ranges,
  stepType,
  unitType,
  products,
  productRates = [],
  onProductRatesChange,
  isProductSpecific = false,
  onChange
}: StepFunctionInputsProps) {
  const formatNumber = (num: number) => num.toLocaleString();
  const parseNumber = (str: string) => parseFloat(str.replace(/,/g, '')) || 0;

  const handleProductRateChange = (productId: string, rangeId: string, value: string) => {
    if (!onProductRatesChange) return;

    const numValue = parseNumber(value);
    const existingRateIndex = productRates.findIndex(r =>
      r.productId === productId && r.rangeId === rangeId
    );

    if (existingRateIndex >= 0) {
      const newRates = [...productRates];
      if (numValue === 0) {
        newRates.splice(existingRateIndex, 1);
      } else {
        newRates[existingRateIndex] = {
          ...newRates[existingRateIndex],
          costPerUnit: numValue
        };
      }
      onProductRatesChange(newRates);
    } else if (numValue > 0) {
      onProductRatesChange([
        ...productRates,
        { productId, rangeId, costPerUnit: numValue }
      ]);
    }
  };

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const startUnits = lastRange ? lastRange.endUnits : 0;
    const newRange: StepFunctionRange = {
      id: crypto.randomUUID(),
      startUnits,
      endUnits: startUnits + 1000,
      ...(stepType === 'fixed' ? { fixedCost: 0 } : { costPerUnit: 0 })
    };
    onChange([...ranges, newRange]);
  };

  const updateRange = (id: string, updates: Partial<StepFunctionRange>) => {
    onChange(ranges.map(range =>
      range.id === id ? { ...range, ...updates } : range
    ));
  };

  const removeRange = (id: string) => {
    onChange(ranges.filter(range => range.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">
          Step Points ({stepType === 'fixed' ? 'Fixed Cost' : `Cost per ${unitType}`})
        </h4>
        <button
          type="button"
          onClick={addRange}
          className="inline-flex items-center px-2 py-1 border border-transparent text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Step
        </button>
      </div>

      <div className="space-y-2">
        {!isProductSpecific && <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="text-sm font-medium text-gray-700">Start {unitType}s</div>
          <div className="text-sm font-medium text-gray-700">End {unitType}s</div>
          <div className="text-sm font-medium text-gray-700">
            {stepType === 'fixed' ? 'Fixed Cost ($)' : `Cost per ${unitType} ($)`}
          </div>
        </div>}

        {ranges.map((range, index) => (
          <div key={range.id} className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-500">
              {formatNumber(range.startUnits)}
            </div>
            {isProductSpecific ? (
              <>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={formatNumber(range.endUnits)}
                    onChange={(e) => {
                      const newEndUnits = parseNumber(e.target.value);
                      updateRange(range.id, { endUnits: newEndUnits });
                      if (ranges[index + 1]) {
                        updateRange(ranges[index + 1].id, { startUnits: newEndUnits });
                      }
                    }}
                    className="c-input"
                  />
                </div>
                <div className="col-span-3 pl-4 space-y-2">
                  {products.map(product => {
                    const rate = productRates.find(r =>
                      r.productId === product.id && r.rangeId === range.id
                    );
                    return (
                      <div key={product.id} className="flex items-center space-x-4">
                        <div className="w-1/3">
                          <label className="block text-sm text-gray-600">
                            {product.name}
                          </label>
                        </div>
                        <div className="w-2/3 flex items-center space-x-2">
                          <input
                            type="number"
                            value={rate ? formatNumber(rate.costPerUnit) : ''}
                            onChange={(e) => handleProductRateChange(
                              product.id,
                              range.id,
                              e.target.value
                            )}
                            placeholder={`Cost per ${unitType}`}
                            className="c-input"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div>
                  <input
                    type="number"
                    value={formatNumber(range.endUnits)}
                    onChange={(e) => {
                      const newEndUnits = parseNumber(e.target.value);
                      updateRange(range.id, { endUnits: newEndUnits });
                      if (ranges[index + 1]) {
                        updateRange(ranges[index + 1].id, { startUnits: newEndUnits });
                      }
                    }}
                    className="c-input"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formatNumber(stepType === 'fixed' ? range.fixedCost || 0 : range.costPerUnit || 0)}
                    onChange={(e) => {
                      const value = parseNumber(e.target.value);
                      updateRange(range.id,
                        stepType === 'fixed'
                          ? { fixedCost: value }
                          : { costPerUnit: value }
                      );
                    }}
                    className="c-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeRange(range.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Leave cost empty to exclude a product from this range's costs
      </p>
    </div>
  );
}