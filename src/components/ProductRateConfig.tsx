import type { Plant, Product, TimeUnit } from '../types';
import { safeGetUnitType } from '../utils/safeAccess';

interface ProductRateConfigProps {
  plant: Plant;
  product: Product;
  onChange: (updates: Partial<Plant['products'][string]>) => void;
}

const TIME_UNITS: TimeUnit[] = ['hour', 'day', 'week', 'month', 'year'];

export function ProductRateConfig({ plant, product, onChange }: ProductRateConfigProps) {
  // Initialize product config if it doesn't exist
  const productConfig = plant.products[product.id] || {};

  // Initialize rate with default values if it doesn't exist
  const rate = productConfig.rate || { units: 0, timeUnit: 'hour' as TimeUnit };

  // Initialize operating time with default values if it doesn't exist
  const operatingTime = plant.operatingTime || {
    hoursPerDay: 8,
    daysPerWeek: 5,
    weeksPerYear: 50
  };

  const handleRateChange = (field: 'units' | 'timeUnit', value: any) => {
    onChange({
      ...productConfig,
      rate: {
        ...rate,
        [field]: field === 'units' ? (parseFloat(value) || 0) : value
      }
    });
  };

  const calculateCapacity = (rateValue: number, timeUnit: TimeUnit) => {
    const { hoursPerDay, daysPerWeek, weeksPerYear } = operatingTime;
    const hoursPerYear = hoursPerDay * daysPerWeek * weeksPerYear;
    // const daysPerYear = daysPerWeek * weeksPerYear;
    // const monthsPerYear = weeksPerYear / 4.33; // Approximate weeks per month

    let unitsPerHour: number;
    switch (timeUnit) {
      case 'hour':
        unitsPerHour = rateValue;
        break;
      case 'day':
        unitsPerHour = rateValue / hoursPerDay;
        break;
      case 'week':
        unitsPerHour = rateValue / (hoursPerDay * daysPerWeek);
        break;
      case 'month':
        unitsPerHour = rateValue / (hoursPerDay * daysPerWeek * 4.33);
        break;
      case 'year':
        unitsPerHour = rateValue / hoursPerYear;
        break;
      default:
        unitsPerHour = 0;
    }

    return {
      daily: unitsPerHour * hoursPerDay,
      weekly: unitsPerHour * hoursPerDay * daysPerWeek,
      monthly: unitsPerHour * hoursPerDay * daysPerWeek * 4.33,
      yearly: unitsPerHour * hoursPerYear
    };
  };

  const capacities = calculateCapacity(rate?.units || 0, rate?.timeUnit || 'hour');
  const formatNumber = (num: number) => Math.round(num || 0).toLocaleString();
  const unitType = safeGetUnitType(plant);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Production Rate
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            min="0"
            value={rate?.units || 0}
            onChange={(e) => handleRateChange('units', e.target.value)}
            className="c-input"
          />
          <select
            value={rate?.timeUnit || 'hour'}
            onChange={(e) => handleRateChange('timeUnit', e.target.value as TimeUnit)}
            className="c-input w-40"
          >
            {TIME_UNITS.map(unit => (
              <option key={unit} value={unit}>
                Per {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Capacity Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-green-800">Daily Capacity:</span>
            <span className="text-green-900 font-medium">
              {formatNumber(capacities.daily)} { unitType }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-800">Weekly Capacity:</span>
            <span className="text-green-900 font-medium">
              {formatNumber(capacities.weekly)} { unitType }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-800">Monthly Capacity:</span>
            <span className="text-green-900 font-medium">
              {formatNumber(capacities.monthly)} { unitType }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-800">Annual Capacity:</span>
            <span className="text-green-900 font-medium">
              {formatNumber(capacities.yearly)} { unitType   }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}