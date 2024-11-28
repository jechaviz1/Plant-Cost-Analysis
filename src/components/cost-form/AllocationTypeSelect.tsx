import React from 'react';
import type { Cost } from '../../types';

type AllocationType = Cost['allocationType'];

interface AllocationTypeSelectProps {
  value: AllocationType;
  onChange: (type: AllocationType) => void;
}

export function AllocationTypeSelect({ value, onChange }: AllocationTypeSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Cost Allocation
      </label>
      <div className="flex space-x-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="plant-wide"
            checked={value === 'plant-wide'}
            onChange={() => onChange('plant-wide')}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-sm text-gray-700">Plant-wide cost</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="product-specific"
            checked={value === 'product-specific'}
            onChange={() => onChange('product-specific')}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-sm text-gray-700">Product-specific cost</span>
        </label>
      </div>
    </div>
  );
}