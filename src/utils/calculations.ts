import type { Plant, CostPoint, Cost, PLAnalysis, Product } from '../types';

function calculateFixedCost(
  cost: Cost,// & { type: 'fixed' },
  units: { [productId: string]: number }
): number {
  // If it's plant-wide, always apply the fixed cost
  if (cost.allocationType === 'plant-wide') {
    return cost.amount || 0;
  }

  // If it's product-specific, only apply if we're producing that product
  if (cost.specificToProduct && units[cost.specificToProduct] > 0) {
    return cost.amount || 0;
  }

  return 0;
}

function calculateVariableCost(
  cost: Cost,// & { type: 'variable' },
  units: { [productId: string]: number }
): number {
  if (cost.allocationType === 'plant-wide') {
    // For plant-wide, apply the same rate to all units
    const totalUnits = Object.values(units).reduce((sum, u) => sum + u, 0);

    if (cost.stepType === 'variable' && cost.ranges) {
      // Find applicable range
      const range = cost.ranges.find(r =>
        totalUnits >= r.startUnits && totalUnits <= r.endUnits
      );
      return range ? totalUnits * (range.costPerUnit || 0) : 0;
    }

    return totalUnits * (cost.costPerUnit || 0);
  }

  if (cost.allocationType === 'product-specific' && cost.specificToProduct) {
    // For product-specific, only apply to units of that product
    const productUnits = units[cost.specificToProduct] || 0;

    if (cost.stepType === 'variable' && cost.ranges && cost.productRangeRates) {
      // Find applicable range
      const range = cost.ranges.find(r =>
        productUnits >= r.startUnits && productUnits <= r.endUnits
      );
      if (range) {
        const productRate = cost.productRangeRates.find(
          r => r.productId === cost.specificToProduct && r.rangeId === range.id
        );
        return productUnits * (productRate?.costPerUnit || 0);
      }
      return 0;
    }

    // Check if there's a specific rate for this product
    const productRate = cost.productSpecificRates?.find(
      rate => rate.productId === cost.specificToProduct
    );

    const rateToUse = productRate?.costPerUnit || cost.costPerUnit || 0;
    return productUnits * rateToUse;
  }

  return 0;
}

function calculateSemiVariableCost(
  cost: Cost,// & { type: 'semi-variable' },
  units: { [productId: string]: number }
): number {
  const totalUnits = cost.allocationType === 'plant-wide'
    ? Object.values(units).reduce((sum, u) => sum + u, 0)
    : cost.specificToProduct
      ? units[cost.specificToProduct] || 0
      : 0;

  if (totalUnits === 0) return 0;

  const baseUnits = cost.baseUnits || 1;
  const baseCost = cost.baseCost || 0;
  const scaleFactor = cost.scaleFactor || 1;

  // Calculate percentage change in units from base
  const percentageChange = (totalUnits - baseUnits) / baseUnits;

  // Apply scale factor to the percentage change
  const scaledChange = percentageChange * scaleFactor;

  // Calculate the cost change and add to base cost
  return baseCost * (1 + scaledChange);
}

function calculateStepFunctionCost(
  cost: Cost,// & { type: 'step-function' },
  units: { [productId: string]: number }
): number {
  const totalUnits = cost.allocationType === 'plant-wide'
    ? Object.values(units).reduce((sum, u) => sum + u, 0)
    : cost.specificToProduct
      ? units[cost.specificToProduct] || 0
      : 0;

  const sortedRanges = [...(cost.ranges || [])].sort((a, b) => a.startUnits - b.startUnits);

  if (sortedRanges.length === 0) return 0;

  let totalCost = 0;
  const remainingUnits = totalUnits;
  let currentIndex = 0;

  while (remainingUnits > 0 && currentIndex < sortedRanges.length) {
    const range = sortedRanges[currentIndex];

    const rangeUnits = Math.min(
      remainingUnits,
      range.endUnits - range.startUnits
    );

    if (rangeUnits > 0) {
      if (cost.stepType === 'fixed') {
        totalCost += range.fixedCost || 0;
      } else {
        totalCost += rangeUnits * (range.costPerUnit || 0);
      }
    }

    currentIndex++;
  }

  return totalCost;
}

export function calculateTotalCost(
  productUnits: { [productId: string]: number },
  config: Plant
): CostPoint {
  if (!productUnits || !config || !config.products || !config.costs) {
    return {
      units: 0,
      cost: 0,
      breakdown: {}
    };
  }

  const totalUnits = Object.values(productUnits).reduce((sum, u) => sum + u, 0);
  if (totalUnits === 0) {
    return {
      units: 0,
      cost: 0,
      breakdown: {}
    };
  }

  try {
    const breakdown: Record<string, number> = {};
    let totalCost = 0;
    const validCosts = config.costs.filter(cost => cost !== null && cost !== undefined);

    for (const cost of validCosts) {
      if (!cost) continue;
      let costAmount = 0;

      switch (cost.type) {
        case 'fixed':
          costAmount = calculateFixedCost(cost, productUnits);
          break;
        case 'variable':
          costAmount = calculateVariableCost(cost, productUnits);
          break;
        case 'semi-variable':
          costAmount = calculateSemiVariableCost(cost, productUnits);
          break;
        case 'step-function':
          costAmount = calculateStepFunctionCost(cost, productUnits);
          break;
      }

      breakdown[cost.name] = costAmount;
      totalCost += costAmount;
    }

    // Add product-specific setup costs
    Object.entries(productUnits).forEach(([productId, units]) => {
      const productConfig = config.products[productId];
      if (units > 0 && productConfig?.setupCost) {
        const costName = `Setup Cost - ${productId}`;
        breakdown[costName] = productConfig.setupCost;
        totalCost += productConfig.setupCost;
      }
    });

    return { units: totalUnits, cost: totalCost, breakdown };
  } catch (error) {
    console.error('Error calculating total cost:', error);
    return {
      units: 0,
      cost: 0,
      breakdown: {}
    };
  }
}

export function generateCostCurve(
  config: Plant,
  productId?: string
): CostPoint[] {
  if (!config || !config.products) {
    return [{
      units: 0,
      cost: 0,
      breakdown: {}
    }];
  }

  const capacity = productId ? config.products[productId]?.capacity || config.capacity : config.capacity;
  if (!capacity) {
    return [{
      units: 0,
      cost: 0,
      breakdown: {}
    }];
  }

  const interval = calculateReasonableInterval(capacity);
  const points: CostPoint[] = [];

  for (let units = 0; units <= capacity; units += interval) {
    const productUnits = productId
      ? { [productId]: units }
      : { [Object.keys(config.products)[0]]: units };
    points.push(calculateTotalCost(productUnits, config));
  }

  // Ensure the last point is exactly at capacity if it's not already included
  if (capacity % interval !== 0) {
    const productUnits = productId
      ? { [productId]: capacity }
      : { [Object.keys(config.products)[0]]: capacity };
    points.push(calculateTotalCost(productUnits, config));
  }

  return points;
}

export function generatePLAnalysis(
  config: Plant,
  product?: Product
): PLAnalysis[] {
  if (!config || !config.products) {
    return [{
      units: 0,
      totalCost: 0,
      costBreakdown: {},
      costPerUnit: 0
    }];
  }

  const capacity = product ? config.products[product.id]?.capacity || config.capacity : config.capacity;
  if (!capacity) {
    return [{
      units: 0,
      totalCost: 0,
      costBreakdown: {},
      costPerUnit: 0
    }];
  }

  const interval = calculateReasonableInterval(capacity);
  const analysis: PLAnalysis[] = [];

  for (let units = 0; units <= capacity; units += interval) {
    const productUnits = product
      ? { [product.id]: units }
      : { [Object.keys(config.products)[0]]: units };

    const { cost: totalCost, breakdown } = calculateTotalCost(productUnits, config);
    const revenue = product ? units * product.price : 0;

    analysis.push({
      units,
      totalCost,
      costBreakdown: breakdown,
      costPerUnit: units > 0 ? totalCost / units : 0,
      ...(product && {
        products: {
          [product.id]: {
            units,
            revenue,
            cost: totalCost,
            profit: revenue - totalCost,
            costPerUnit: units > 0 ? totalCost / units : 0
          }
        }
      })
    });
  }

  // Add the capacity point if it's not already included
  if (capacity % interval !== 0) {
    const productUnits = product
      ? { [product.id]: capacity }
      : { [Object.keys(config.products)[0]]: capacity };

    const { cost: totalCost, breakdown } = calculateTotalCost(productUnits, config);
    const revenue = product ? capacity * product.price : 0;

    analysis.push({
      units: capacity,
      totalCost,
      costBreakdown: breakdown,
      costPerUnit: totalCost / capacity,
      ...(product && {
        products: {
          [product.id]: {
            units: capacity,
            revenue,
            cost: totalCost,
            profit: revenue - totalCost,
            costPerUnit: totalCost / capacity
          }
        }
      })
    });
  }

  return analysis;
}

export function findOptimalProduction(
  config: Plant,
  product?: Product
): CostPoint {
  const capacity = product ? config.products[product.id]?.capacity || config.capacity : config.capacity;

  // Filter out zero units to avoid division by zero
  const pointsWithCostPerUnit = generateCostCurve(config, product?.id)
    .filter(point => point.units > 0 && capacity !== undefined && point.units <= capacity)
    .map(point => ({
      ...point,
      costPerUnit: point.cost / point.units,
      profit: product ? point.units * product.price - point.cost : 0
    }));

  if (pointsWithCostPerUnit.length === 0) return { units: 0, cost: 0, breakdown: {} };

  // If we have a product, optimize for profit instead of cost per unit
  if (product) {
    return pointsWithCostPerUnit.reduce((optimal, point) =>
      point.profit > optimal.profit ? point : optimal
    , pointsWithCostPerUnit[0]);
  }

  // Otherwise, optimize for minimum cost per unit
  return pointsWithCostPerUnit.reduce((optimal, point) =>
    point.costPerUnit < optimal.costPerUnit ? point : optimal
  , pointsWithCostPerUnit[0]);
}

export function calculateReasonableInterval(capacity: number): number {
  if (capacity <= 10) return 1;
  if (capacity <= 100) return 10;
  if (capacity <= 1000) return 100;

  const magnitude = Math.floor(Math.log10(capacity));
  const base = Math.pow(10, magnitude - 1);
  return Math.max(base, Math.ceil(capacity / 20));
}