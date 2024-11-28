import { useState } from 'react';
import { Info } from 'lucide-react';
import type { Cost } from '../../types';

type CostType = Cost['type'];

const COST_TYPE_EXPLANATIONS = {
  fixed: "A fixed cost remains constant regardless of production volume. Examples include rent, insurance, or equipment leases.",
  variable: "A variable cost changes directly with production volume, calculated on a per-unit basis. Examples include raw materials or direct labor.",
  'semi-variable': "A semi-variable cost has both fixed and variable components, scaling with production but not proportionally. Examples include utilities or maintenance.",
  'step-function': "A step function cost changes at specific production levels, either as fixed amounts or per-unit costs. Examples include additional equipment or labor shifts."
};

interface CostTypeSelectProps {
  value: CostType;
  onChange: (type: CostType) => void;
}

export function CostTypeSelect({ value, onChange }: CostTypeSelectProps) {
  const [hoveredType, setHoveredType] = useState<CostType | null>(null);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Cost Type
      </label>
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(COST_TYPE_EXPLANATIONS) as CostType[]).map((type) => (
          <div
            key={type}
            className="relative"
            onMouseEnter={() => setHoveredType(type)}
            onMouseLeave={() => setHoveredType(null)}
          >
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={value === type}
                onChange={() => onChange(type)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">
                {type.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
              <Info className="w-4 h-4 text-gray-400" />
            </label>
            {hoveredType === type && (
              <div className="absolute z-10 mt-2 w-64 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                {COST_TYPE_EXPLANATIONS[type]}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}