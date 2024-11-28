import { describe, test, expect } from 'vitest';
import { optimizeProduction } from '../utils/optimization';
import type { Plant } from '../types';

describe('Advanced Production Optimization', () => {
  test('handles linear cost structures correctly', () => {
    const plants: Plant[] = [
      {
        id: '1',
        name: 'Plant A',
        capacity: 1000,
        unitType: 'Unit',
        price: 100,
        costs: [
          {
            id: '1',
            name: 'Fixed Cost',
            type: 'fixed',
            amount: 1000
          },
          {
            id: '2',
            name: 'Variable Cost',
            type: 'variable',
            costPerUnit: 50
          }
        ]
      },
      {
        id: '2',
        name: 'Plant B',
        capacity: 1000,
        unitType: 'Unit',
        price: 100,
        costs: [
          {
            id: '3',
            name: 'Fixed Cost',
            type: 'fixed',
            amount: 2000
          },
          {
            id: '4',
            name: 'Variable Cost',
            type: 'variable',
            costPerUnit: 40
          }
        ]
      }
    ];

    const result = optimizeProduction(plants, 100, 1500);
    
    // Plant B should be preferred due to lower variable cost
    expect(result.plantAllocations[1].units).toBeGreaterThan(result.plantAllocations[0].units);
    expect(result.totalProfit).toBeGreaterThan(0);
  });

  test('handles semi-variable costs correctly', () => {
    const plant: Plant = {
      id: '1',
      name: 'Semi-Variable Plant',
      capacity: 1000,
      unitType: 'Unit',
      price: 100,
      costs: [
        {
          id: '1',
          name: 'Semi-Variable Cost',
          type: 'semi-variable',
          baseUnits: 500,
          baseCost: 10000,
          scaleFactor: 0.8
        }
      ]
    };

    const result = optimizeProduction([plant], 100, 1000);
    
    // Should find optimal production considering economies of scale
    expect(result.plantAllocations[0].units).toBeGreaterThan(0);
    expect(result.totalProfit).toBeGreaterThan(0);
  });

  test('handles step function costs correctly', () => {
    const plant: Plant = {
      id: '1',
      name: 'Step Function Plant',
      capacity: 1000,
      unitType: 'Unit',
      price: 100,
      costs: [
        {
          id: '1',
          name: 'Step Function Cost',
          type: 'step-function',
          stepType: 'variable',
          ranges: [
            {
              id: '1',
              startUnits: 0,
              endUnits: 300,
              costPerUnit: 70
            },
            {
              id: '2',
              startUnits: 300,
              endUnits: 600,
              costPerUnit: 50
            },
            {
              id: '3',
              startUnits: 600,
              endUnits: 1000,
              costPerUnit: 40
            }
          ]
        }
      ]
    };

    const result = optimizeProduction([plant], 100, 1000);
    
    // Should prefer production in the most efficient range
    expect(result.plantAllocations[0].units).toBeGreaterThanOrEqual(600);
    expect(result.totalProfit).toBeGreaterThan(0);
  });

  test('respects total demand constraint', () => {
    const plants: Plant[] = [
      {
        id: '1',
        name: 'Plant A',
        capacity: 1000,
        unitType: 'Unit',
        price: 100,
        costs: [
          {
            id: '1',
            name: 'Variable Cost',
            type: 'variable',
            costPerUnit: 50
          }
        ]
      },
      {
        id: '2',
        name: 'Plant B',
        capacity: 1000,
        unitType: 'Unit',
        price: 100,
        costs: [
          {
            id: '2',
            name: 'Variable Cost',
            type: 'variable',
            costPerUnit: 60
          }
        ]
      }
    ];

    const demand = 800;
    const result = optimizeProduction(plants, 100, demand);
    
    expect(result.totalUnits).toBeLessThanOrEqual(demand);
    // Should prefer Plant A due to lower variable cost
    expect(result.plantAllocations[0].units).toBeGreaterThan(result.plantAllocations[1].units);
  });

  test('handles mixed cost structures across plants', () => {
    const plants: Plant[] = [
      {
        id: '1',
        name: 'Linear Plant',
        capacity: 500,
        unitType: 'Unit',
        price: 100,
        costs: [
          {
            id: '1',
            name: 'Variable Cost',
            type: 'variable',
            costPerUnit: 50
          }
        ]
      },
      {
        id: '2',
        name: 'Semi-Variable Plant',
        capacity: 500,
        unitType: 'Unit',
        price: 100,
        costs: [
          {
            id: '2',
            name: 'Semi-Variable Cost',
            type: 'semi-variable',
            baseUnits: 250,
            baseCost: 5000,
            scaleFactor: 0.8
          }
        ]
      }
    ];

    const result = optimizeProduction(plants, 100, 750);
    
    expect(result.totalUnits).toBeLessThanOrEqual(750);
    expect(result.totalProfit).toBeGreaterThan(0);
    // Both plants should be utilized due to their complementary cost structures
    expect(result.plantAllocations[0].units).toBeGreaterThan(0);
    expect(result.plantAllocations[1].units).toBeGreaterThan(0);
  });
});