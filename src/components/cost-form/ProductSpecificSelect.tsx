import type { Product } from '../../types';

interface ProductSpecificSelectProps {
  products: Product[];
  selectedProductId?: string;
  onChange: (productId: string) => void;
}

export function ProductSpecificSelect({
  products,
  selectedProductId,
  onChange
}: ProductSpecificSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Specific to Product
      </label>
      <select
        value={selectedProductId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="c-input"
      >
        <option value="">Select a product</option>
        {products.map(product => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
    </div>
  );
}