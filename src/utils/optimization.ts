import solver from 'javascript-lp-solver';
import { calculateTotalCost } from './calculations';
import type { Plant, Product, OptimizationResult } from '../types';

interface ProductionVariable {
  plantId: string;
  productId: string;
}

function createMultiProductModel(
  plants: Plant[],
  products: Product[],
): { model: any; variables: ProductionVariable[] } {
  const model = {
    optimize: "profit",
    opType: "max",
    constraints: {} as any,
    variables: {} as any,
    ints: {} as any
  };

  const variables: ProductionVariable[] = [];

  // Add demand constraints for each product
  products.forEach(product => {
    model.constraints[`demand_${product.id}`] = {
      min: product.minProduction || 0,
      max: product.demand
    };
  });

  // Add capacity constraints for each plant
  plants.forEach((plant, plantIndex) => {
    model.constraints[`capacity_${plant.id}`] = { max: plant.capacity };
  });

  // Create variables for each plant-product combination
  plants.forEach(plant => {
    products.forEach(product => {
      if (plant.products[product.id]) {
        const varName = `${plant.id}_${product.id}`;
        variables.push({ plantId: plant.id, productId: product.id });

        // Add to demand constraint
        model.constraints[`demand_${product.id}`][varName] = 1;

        // Add to plant capacity constraint
        model.constraints[`capacity_${plant.id}`][varName] = 1;

        // Calculate approximate coefficients for the objective function
        const testPoints = [0, plant.products[product.id].capacity / 2, plant.products[product.id].capacity];
        const costs = testPoints.map(units => {
          const totalCost = calculateTotalCost({ [product.id]: units }, plant);
          return totalCost.cost;
        });

        // Linear regression for cost approximation
        const n = testPoints.length;
        const sumX = testPoints.reduce((a, b) => a + b, 0);
        const sumY = costs.reduce((a, b) => a + b, 0);
        const sumXY = testPoints.reduce((sum, x, i) => sum + x * costs[i], 0);
        const sumXX = testPoints.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Add variable to model
        model.variables[varName] = {
          profit: product.price - slope,
          ...Object.fromEntries(
            Object.keys(model.constraints).map(constraint => [
              constraint,
              constraint === `capacity_${plant.id}` || constraint === `demand_${product.id}` ? 1 : 0
            ])
          )
        };

        // Handle setup costs and changeover constraints if defined
        if (plant.products[product.id].setupCost) {
          const setupVarName = `setup_${plant.id}_${product.id}`;
          model.variables[setupVarName] = {
            profit: -plant.products[product.id].setupCost!,
            ...Object.fromEntries(
              Object.keys(model.constraints).map(constraint => [constraint, 0])
            )
          };
          model.ints[setupVarName] = 1;

          // Link setup variable to production
          model.constraints[`setup_${plant.id}_${product.id}`] = {
            min: 0,
            max: 0
          };
          model.constraints[`setup_${plant.id}_${product.id}`][varName] = -plant.capacity;
          model.constraints[`setup_${plant.id}_${product.id}`][setupVarName] = plant.capacity;
        }
      }
    });
  });

  return { model, variables };
}

export function optimizeProduction(
  plants: Plant[],
  products: Product[]
): OptimizationResult {
  // Create and solve linear model
  const { model, variables } = createMultiProductModel(plants, products);
  const solution = solver.Solve(model) || {}; // Ensure solution is an object

  // Process solution into plant allocations
  const plantAllocations = plants.map(plant => {
    const productAllocations = Object.fromEntries(
      products.map(product => {
        const varName = `${plant.id}_${product.id}`;
        const units = solution[varName] || 0;
        return [product.id, units];
      })
    );

    const totalUnits = Object.values(productAllocations).reduce((sum, units) => sum + units, 0);
    const { cost: totalCost } = calculateTotalCost(productAllocations, plant);
    const revenue = Object.entries(productAllocations).reduce(
      (sum, [productId, units]) => sum + units * (products.find(p => p.id === productId)?.price || 0),
      0
    );

    return {
      plantId: plant.id,
      units: totalUnits,
      capacity: plant.capacity || 0,
      capacityUtilization: plant.capacity ? (totalUnits / plant.capacity) * 100 : 0,
      products: Object.fromEntries(
        products.map(product => {
          const units = productAllocations[product.id] || 0;
          const revenue = units * product.price;
          const { cost } = calculateTotalCost({ [product.id]: units }, plant);
          return [
            product.id,
            {
              units,
              revenue,
              cost,
              profit: revenue - cost
            }
          ];
        })
      ),
      cost: totalCost,
      revenue,
      profit: revenue - totalCost
    };
  });

  const productTotals = Object.fromEntries(
    products.map(product => {
      const totalUnits = plantAllocations.reduce(
        (sum, plant) => sum + (plant.products[product.id]?.units || 0),
        0
      );
      const totalRevenue = plantAllocations.reduce(
        (sum, plant) => sum + (plant.products[product.id]?.revenue || 0),
        0
      );
      const totalCost = plantAllocations.reduce(
        (sum, plant) => sum + (plant.products[product.id]?.cost || 0),
        0
      );

      return [
        product.id,
        {
          units: totalUnits,
          revenue: totalRevenue,
          cost: totalCost,
          profit: totalRevenue - totalCost,
          demandMet: totalUnits >= (product.minProduction || 0) && totalUnits <= product.demand
        }
      ];
    })
  );

  return {
    plantAllocations,
    totalUnits: plantAllocations.reduce((sum, p) => sum + p.units, 0),
    totalCost: plantAllocations.reduce((sum, p) => sum + p.cost, 0),
    totalRevenue: plantAllocations.reduce((sum, p) => sum + p.revenue, 0),
    totalProfit: plantAllocations.reduce((sum, p) => sum + p.profit, 0),
    totalCapacity: plants.reduce((sum, p) => sum + (p.capacity || 0), 0),
    productTotals
  };
}