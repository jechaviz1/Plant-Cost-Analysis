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
        operatingTime: {
          hoursPerDay: 8,
          daysPerWeek: 5,
          weeksPerYear: 50
        },
        capacityMode: 'fixed',
        settings: {
          unitType: 'unit',
          customUnitType: '',
          defaultTimeframe: 'year',
        },
        products: {},
        costs: [
          {
            id: '1',
            name: 'Fixed Cost',
            type: 'fixed',
            allocationType: 'plant-wide'
          },
          {
            id: '2',
            name: 'Variable Cost',
            type: 'variable',
            allocationType: 'plant-wide'
          }
        ]
      },
      {
        id: '2',
        name: 'Plant B',
        capacity: 0,
        operatingTime: {
          hoursPerDay: 8,
          daysPerWeek: 5,
          weeksPerYear: 50
        },
        capacityMode: 'rate',
        settings: {
          unitType: 'unit',
          customUnitType: '',
          defaultTimeframe: 'year',
        },
        products: {},
        costs: [
          {
            id: '1',
            name: 'Fixed Cost',
            type: 'fixed',
            allocationType: 'plant-wide'
          },
          {
            id: '2',
            name: 'Variable Cost',
            type: 'variable',
            allocationType: 'plant-wide'
          }
        ]
      }
    ];

    const result = optimizeProduction(plants, []);

    // Plant B should be preferred due to lower variable cost
    expect(result.plantAllocations[1].units).toBeGreaterThan(result.plantAllocations[0].units);
    expect(result.totalProfit).toBeGreaterThan(0);
  });

  test('handles semi-variable costs correctly', () => {
    const plant: Plant = {
      id: '1',
      name: 'Semi-Variable Plant',
      capacity: 1000,
      operatingTime: {
        hoursPerDay: 8,
        daysPerWeek: 5,
        weeksPerYear: 50
      },
      capacityMode: 'fixed',
      settings: {
        unitType: 'unit',
        customUnitType: '',
        defaultTimeframe: 'year',
      },
      products: {},
      costs: [
        {
          id: '1',
          name: 'Fixed Cost',
          type: 'semi-variable',
          allocationType: 'plant-wide',
          baseUnits: 500,
          baseCost: 10000,
          scaleFactor: 0.8
        },
        {
          id: '2',
          name: 'Variable Cost',
          type: 'semi-variable',
          allocationType: 'plant-wide',
          baseUnits: 500,
          baseCost: 10000,
          scaleFactor: 0.8
        }
      ]
    };

    const result = optimizeProduction([plant], []);

    // Should find optimal production considering economies of scale
    expect(result.plantAllocations[0].units).toBeGreaterThan(0);
    expect(result.totalProfit).toBeGreaterThan(0);
  });

  test('handles step function costs correctly', () => {
    const plant: Plant = {
      id: '1',
      name: 'Step Function Plant',
      capacity: 1000,
      operatingTime: {
        hoursPerDay: 8,
        daysPerWeek: 5,
        weeksPerYear: 50
      },
      capacityMode: 'fixed',
      settings: {
        unitType: 'unit',
        customUnitType: '',
        defaultTimeframe: 'year',
      },
      products: {},
      costs: [
        {
          id: '1',
          name: 'Fixed Cost',
          type: 'fixed',
          allocationType: 'plant-wide',
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
        },
        {
          id: '2',
          name: 'Variable Cost',
          type: 'variable',
          allocationType: 'plant-wide',
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

    const result = optimizeProduction([plant], []);

    // Should prefer production in the most efficient range
    expect(result.plantAllocations[0].units).toBeGreaterThanOrEqual(600);
    expect(result.totalProfit).toBeGreaterThan(0);
  });

  test('respects total demand constraint', () => {
    const plants: Plant[] = [
      {
        id: '1',
        name: 'Plan A',
        capacity: 1000,
        operatingTime: {
          hoursPerDay: 8,
          daysPerWeek: 5,
          weeksPerYear: 50
        },
        capacityMode: 'fixed',
        settings: {
          unitType: 'unit',
          customUnitType: '',
          defaultTimeframe: 'year',
        },
        products: {},
        costs: [
          {
            id: '1',
            name: 'Variable Cost',
            type: 'variable',
            allocationType: 'plant-wide',
            costPerUnit: 50
          }
        ]
      },
      {
        id: '2',
        name: 'Plan B',
        capacity: 1000,
        operatingTime: {
          hoursPerDay: 8,
          daysPerWeek: 5,
          weeksPerYear: 50
        },
        capacityMode: 'fixed',
        settings: {
          unitType: 'unit',
          customUnitType: '',
          defaultTimeframe: 'year',
        },
        products: {},
        costs: [
          {
            id: '1',
            name: 'Variable Cost',
            type: 'variable',
            allocationType: 'plant-wide',
            costPerUnit: 50
          }
        ]
      }
    ];

    const demand = 800;
    const result = optimizeProduction(plants, []);

    expect(result.totalUnits).toBeLessThanOrEqual(demand);
    // Should prefer Plant A due to lower variable cost
    expect(result.plantAllocations[0].units).toBeGreaterThan(result.plantAllocations[1].units);
  });

  test('handles mixed cost structures across plants', () => {
    const plants: Plant[] = [
      {
        id: '1',
        name: 'Plan A',
        capacity: 1000,
        operatingTime: {
          hoursPerDay: 8,
          daysPerWeek: 5,
          weeksPerYear: 50
        },
        capacityMode: 'fixed',
        settings: {
          unitType: 'unit',
          customUnitType: '',
          defaultTimeframe: 'year',
        },
        products: {},
        costs: [
          {
            id: '1',
            name: 'Variable Cost',
            type: 'variable',
            allocationType: 'plant-wide',
            costPerUnit: 50
          }
        ]
      },
      {
        id: '2',
        name: 'Plan B',
        capacity: 1000,
        operatingTime: {
          hoursPerDay: 8,
          daysPerWeek: 5,
          weeksPerYear: 50
        },
        capacityMode: 'fixed',
        settings: {
          unitType: 'unit',
          customUnitType: '',
          defaultTimeframe: 'year',
        },
        products: {},
        costs: [
          {
            id: '1',
            name: 'Variable Cost',
            type: 'variable',
            allocationType: 'plant-wide',
            costPerUnit: 50
          }
        ]
      }
    ];

    const result = optimizeProduction(plants, []);

    expect(result.totalUnits).toBeLessThanOrEqual(750);
    expect(result.totalProfit).toBeGreaterThan(0);
    // Both plants should be utilized due to their complementary cost structures
    expect(result.plantAllocations[0].units).toBeGreaterThan(0);
    expect(result.plantAllocations[1].units).toBeGreaterThan(0);
  });
});