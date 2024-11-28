interface FixedCostInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function FixedCostInput({ value, onChange }: FixedCostInputProps) {
  const formatNumber = (num: number) => num.toLocaleString();
  const parseNumber = (str: string) => parseFloat(str.replace(/,/g, '')) || 0;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Fixed Amount ($)
      </label>
      <input
        type="number"
        value={formatNumber(value)}
        onChange={(e) => onChange(parseNumber(e.target.value))}
        className="c-input"
      />
    </div>
  );
}