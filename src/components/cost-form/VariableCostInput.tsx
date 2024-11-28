import type { Product, ProductSpecificRate } from '../../types';

interface VariableCostInputProps {
  value: number;
  unitType: string;
  onChange: (value: number) => void;
  products?: Product[];
  productRates?: ProductSpecificRate[];
  onProductRatesChange?: (rates: ProductSpecificRate[]) => void;
  isProductSpecific?: boolean;
}

export function VariableCostInput({
  value,
  unitType,
  onChange,
  products = [],
  productRates = [],
  onProductRatesChange,
  isProductSpecific = false
}: VariableCostInputProps) {
  const formatNumber = (num: number) => num.toLocaleString();
  const parseNumber = (str: string) => parseFloat(str.replace(/,/g, '')) || 0;

  if (isProductSpecific && products.length > 0) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Product-Specific Rates</h4>
        <div className="space-y-3">
          {products.map(product => {
            const rate = productRates?.find(r => r.productId === product.id);
            return (
              <div key={product.id} className="flex items-center space-x-4">
                <div className="w-1/3">
                  <label className="block text-sm text-gray-600">
                    {product.name}
                  </label>
                </div>
                <div className="w-2/3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={rate ? formatNumber(rate.costPerUnit) : ''}
                      onChange={(e) => {
                        if (!onProductRatesChange) return;
                        const newRate = parseNumber(e.target.value);
                        const newRates = [...(productRates || [])];
                        const existingIndex = newRates.findIndex(r => r.productId === product.id);

                        if (existingIndex >= 0) {
                          newRates[existingIndex] = { ...newRates[existingIndex], costPerUnit: newRate };
                        } else {
                          newRates.push({ productId: product.id, costPerUnit: newRate });
                        }

                        onProductRatesChange(newRates);
                      }}
                      className="c-input"
                      placeholder={`Cost per ${unitType}`}
                    />
                    <span className="text-sm text-gray-500">per {unitType}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Cost per {unitType} ($)
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={formatNumber(value)}
          onChange={(e) => onChange(parseNumber(e.target.value))}
          className="c-input"
        />
        <span className="text-sm text-gray-500">per {unitType}</span>
      </div>
    </div>
  );
}