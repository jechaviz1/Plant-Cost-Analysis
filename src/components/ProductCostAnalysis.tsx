import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { calculateTotalCost, calculateReasonableInterval } from '../utils/calculations';
import { calculateCapacity, calculateAvailableHours } from '../utils/capacity';
import { safeNumberFormat, safeCurrencyFormat, safePercentFormat, safeGetUnitType } from '../utils/safeAccess';
import { LoadingState } from './LoadingState';
import type { Plant, Product } from '../types';

interface ProductCostAnalysisProps {
  plant: Plant;
  product: Product;
}

export function ProductCostAnalysis({ plant, product }: ProductCostAnalysisProps) {
  if (!plant || !product) {
    return (
      <div className="text-center text-gray-500 py-4">
        Unable to analyze costs. Please check configuration.
      </div>
    );
  }

  const productConfig = plant.products[product.id];
  const unitType = safeGetUnitType(plant);
  
  if (!productConfig) {
    return (
      <div className="text-center text-gray-500 py-4">
        Please configure the product first
      </div>
    );
  }

  // Calculate capacity based on rate or fixed capacity
  let capacity = productConfig.capacity;
  if (!capacity && productConfig.rate && plant.operatingTime) {
    capacity = Math.floor(
      calculateCapacity(
        productConfig.rate.units,
        productConfig.rate.timeUnit,
        'year',
        calculateAvailableHours(plant)
      )
    );
  }

  if (!capacity) {
    return (
      <div className="text-center text-gray-500 py-4">
        Please configure the production rate or capacity for this product
      </div>
    );
  }

  // Generate data points for cost curve
  const data: any[] = [];
  const interval = calculateReasonableInterval(capacity);
  let hasValidData = false;
  
  for (let units = 0; units <= capacity; units += interval) {
    const result = calculateTotalCost({ [product.id]: units }, plant);
    if (typeof result.cost !== 'number' || isNaN(result.cost)) {
      console.warn('Failed to calculate costs for units:', units);
      continue;
    }
    
    const { cost, breakdown } = result;
    if (typeof breakdown !== 'object') continue;

    hasValidData = true;
    data.push({
      units,
      totalCost: cost,
      costPerUnit: units > 0 ? cost / units : 0,
      ...breakdown
    });
  }

  // Add exact capacity point if not included
  if (capacity % interval !== 0) {
    const result = calculateTotalCost({ [product.id]: capacity }, plant);
    if (typeof result.cost === 'number' && !isNaN(result.cost)) {
      const { cost, breakdown } = result;
      data.push({
        units: capacity,
        totalCost: cost,
        costPerUnit: cost / capacity,
        ...breakdown
      });
      hasValidData = true;
    }
  }

  if (!hasValidData || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Unable to calculate costs. Please check cost configuration.
      </div>
    );
  }

  const costTypes = data[0] && typeof data[0] === 'object' ? Object.keys(data[0]).filter(key => 
    key !== 'units' && key !== 'totalCost' && key !== 'costPerUnit'
  ) : [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Cost Analysis for {product.name} ({unitType}s)
      </h3>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="units"
              tickFormatter={safeNumberFormat}
              label={{
                value: `Production ${unitType}s`,
                position: 'bottom',
                offset: 20
              }}
            />
            <YAxis
              yAxisId="cost"
              tickFormatter={safeCurrencyFormat}
              label={{
                value: 'Total Cost ($)',
                angle: -90,
                position: 'insideLeft',
                offset: -40
              }}
            />
            <YAxis
              yAxisId="costPerUnit"
              orientation="right"
              tickFormatter={safeCurrencyFormat}
              label={{
                value: 'Cost per Unit ($)',
                angle: 90,
                position: 'insideRight',
                offset: -40
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'costPerUnit' ? safeCurrencyFormat(value) : safeCurrencyFormat(value),
                name === 'costPerUnit' ? 'Cost per Unit' : name
              ]}
              labelFormatter={(value) => `${safeNumberFormat(value)} units`}
            />
            <Legend />

            {/* Total Cost Line */}
            <Line
              yAxisId="cost"
              type="monotone"
              dataKey="totalCost"
              name="Total Cost"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />

            {/* Cost per Unit Line */}
            <Line
              yAxisId="costPerUnit"
              type="monotone"
              dataKey="costPerUnit"
              name="Cost per Unit"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
            />

            {/* Individual Cost Type Lines */}
            {costTypes.map((costType, index) => (
              <Line
                key={costType}
                yAxisId="cost"
                type="monotone"
                dataKey={costType}
                name={costType}
                stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                strokeDasharray="4 4"
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Cost Breakdown at Maximum Capacity</h4>
        <div className="space-y-2">
          {costTypes.map(costType => {
            const lastPoint = data[data.length - 1] || { totalCost: 0 };
            const cost = lastPoint[costType] || 0;
            const percentage = lastPoint.totalCost ? (cost / lastPoint.totalCost) * 100 : 0;
            
            return (
              <div key={costType} className="flex justify-between">
                <span className="text-blue-800">{costType}:</span>
                <span className="text-blue-900 font-medium">
                  {safeCurrencyFormat(cost)} ({safePercentFormat(percentage)})
                </span>
              </div>
            );
          })}
          <div className="border-t border-blue-200 pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span className="text-blue-800">Total Cost:</span>
              <span className="text-blue-900">
                {safeCurrencyFormat(data[data.length - 1]?.totalCost ?? 0)}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-blue-800">Cost per Unit:</span>
              <span className="text-blue-900">
                {safeCurrencyFormat(data[data.length - 1]?.costPerUnit ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}