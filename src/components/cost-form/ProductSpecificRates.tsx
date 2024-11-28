import type { Product, ProductSpecificRate } from '../../types';

interface ProductSpecificRatesProps {
  products: Product[];
  rates: ProductSpecificRate[];
  onChange: (rates: ProductSpecificRate[]) => void;
}

export function ProductSpecificRates({
  products,
  rates,
  onChange
}: ProductSpecificRatesProps) {
  const handleRateChange = (productId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const existingRate = rates.find(r => r.productId === productId);

    if (existingRate) {
      onChange(rates.map(r =>
        r.productId === productId ? { ...r, costPerUnit: numValue } : r
      ));
    } else {
      onChange([...rates, { productId, costPerUnit: numValue }]);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">Product-Specific Rates</h4>
      {products.map(product => {
        const rate = rates.find(r => r.productId === product.id);
        return (
          <div key={product.id} className="flex items-center space-x-4">
            <div className="w-1/3">
              <label className="block text-sm text-gray-600">
                {product.name}
              </label>
            </div>
            <div className="w-2/3">
              <input
                type="number"
                value={rate?.costPerUnit || ''}
                onChange={(e) => handleRateChange(product.id, e.target.value)}
                className="c-input"
                placeholder="Cost per unit"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}