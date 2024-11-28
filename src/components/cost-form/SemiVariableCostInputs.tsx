interface SemiVariableCostInputsProps {
  baseUnits: number;
  baseCost: number;
  scaleFactor: number;
  unitType: string;
  onChange: (updates: { baseUnits?: number; baseCost?: number; scaleFactor?: number }) => void;
}

export function SemiVariableCostInputs({
  baseUnits,
  baseCost,
  scaleFactor,
  unitType,
  onChange
}: SemiVariableCostInputsProps) {
  const formatNumber = (num: number) => num.toLocaleString();
  const parseNumber = (str: string) => parseFloat(str.replace(/,/g, '')) || 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Base {unitType}s
        </label>
        <input
          type="number"
          value={formatNumber(baseUnits)}
          onChange={(e) => onChange({ baseUnits: parseNumber(e.target.value) })}
          className="c-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Base Cost ($)
        </label>
        <input
          type="number"
          value={formatNumber(baseCost)}
          onChange={(e) => onChange({ baseCost: parseNumber(e.target.value) })}
          className="c-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Scale Factor
        </label>
        <input
          type="number"
          value={scaleFactor}
          onChange={(e) => onChange({ scaleFactor: parseFloat(e.target.value) || 0 })}
          step="0.1"
          className="c-input"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How Scale Factor Works</h4>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>1.0 = Proportional change (100% more units = 100% more cost)</li>
          <li>0.5 = Less than proportional (100% more units = 50% more cost)</li>
          <li>1.5 = More than proportional (100% more units = 150% more cost)</li>
        </ul>
      </div>
    </div>
  );
}