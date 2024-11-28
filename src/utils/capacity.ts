import type { Plant, Product, TimeUnit } from '../types';

// Convert time units to hours
export function convertToHours(value: number, unit: TimeUnit): number {
  switch (unit) {
    case 'hour':
      return value;
    case 'day':
      return value * 24;
    case 'week':
      return value * (24 * 7);
    case 'month':
      return value * (24 * 30.44); // Average days per month
    case 'year':
      return value * (24 * 365.25); // Account for leap years
  }
}

// Convert hours to another time unit
export function convertFromHours(hours: number, toUnit: TimeUnit): number {
  switch (toUnit) {
    case 'hour':
      return hours;
    case 'day':
      return hours / 24;
    case 'week':
      return hours / (24 * 7);
    case 'month':
      return hours / (24 * 30.44);
    case 'year':
      return hours / (24 * 365.25);
  }
}

// Calculate available production hours per year
export function calculateAvailableHours(plant: Plant): number {
  if (!plant.operatingTime) return 0;
  
  const { hoursPerDay, daysPerWeek, weeksPerYear } = plant.operatingTime;
  return hoursPerDay * daysPerWeek * weeksPerYear;
}

// Calculate capacity for a given time period
export function calculateCapacity(
  rate: number,
  rateTimeUnit: TimeUnit,
  targetTimeUnit: TimeUnit,
  availableHours: number
): number {
  // Convert rate to units per hour
  const unitsPerHour = rate / convertToHours(1, rateTimeUnit);
  
  // Calculate capacity for the target time unit
  const targetHours = convertToHours(1, targetTimeUnit);
  const targetCapacity = unitsPerHour * targetHours;

  // Adjust for available operating hours
  const availabilityFactor = availableHours / (24 * 365.25); // Annual availability factor
  return targetCapacity * availabilityFactor;
}

// Calculate product capacities for different time periods
export function calculateProductCapacities(plant: Plant, productId: string): {
  yearly: number;
  monthly: number;
  daily: number;
  hourly: number;
} {
  const productConfig = plant.products[productId];
  if (!productConfig?.rate || !plant.operatingTime) {
    return { yearly: 0, monthly: 0, daily: 0, hourly: 0 };
  }

  const { units: rateUnits, timeUnit: rateTimeUnit } = productConfig.rate;
  const availableHours = calculateAvailableHours(plant);

  return {
    yearly: calculateCapacity(rateUnits, rateTimeUnit, 'year', availableHours),
    monthly: calculateCapacity(rateUnits, rateTimeUnit, 'month', availableHours),
    daily: calculateCapacity(rateUnits, rateTimeUnit, 'day', availableHours),
    hourly: calculateCapacity(rateUnits, rateTimeUnit, 'hour', availableHours)
  };
}

// Get the maximum capacity across all products
export function getMaxCapacity(plant: Plant): {
  maxCapacity: number;
  maxProduct: string;
  timeUnit: TimeUnit;
} {
  let maxCapacity = 0;
  let maxProduct = '';
  let maxTimeUnit: TimeUnit = 'year';

  Object.entries(plant.products).forEach(([productId, config]) => {
    if (config.rate) {
      const capacities = calculateProductCapacities(plant, productId);
      if (capacities.yearly > maxCapacity) {
        maxCapacity = capacities.yearly;
        maxProduct = productId;
        maxTimeUnit = 'year';
      }
    }
  });

  return { maxCapacity, maxProduct, timeUnit: maxTimeUnit };
}