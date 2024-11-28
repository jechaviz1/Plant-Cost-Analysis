/**
 * Safely format a number with locale string
 */
export function safeNumberFormat(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  try {
    return value.toLocaleString();
  } catch {
    return '0';
  }
}

/**
 * Safely format currency
 */
export function safeCurrencyFormat(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) return '$0.00';
  try {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } catch {
    return '$0.00';
  }
}

/**
 * Safely format percentage
 */
export function safePercentFormat(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  try {
    return `${value.toFixed(1)}%`;
  } catch {
    return '0%';
  }
}

/**
 * Safely get unit type from plant settings
 */
export function safeGetUnitType(plant: any, fallback = 'unit'): string {
  try {
    if (!plant?.settings) return fallback;
    const { unitType, customUnitType } = plant.settings;
    if (!unitType) return fallback;
    return unitType === 'other' && customUnitType ? customUnitType : unitType;
  } catch {
    return fallback;
  }
}

/**
 * Safely get time period from plant settings
 */
export function safeGetTimePeriod(plant: any, fallback: 'month' | 'year' = 'year'): 'month' | 'year' {
  try {
    return plant?.settings?.defaultTimeframe || fallback;
  } catch {
    return fallback;
  }
}