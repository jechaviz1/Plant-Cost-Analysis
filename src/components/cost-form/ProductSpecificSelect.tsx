import React from 'react';
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
  );
}