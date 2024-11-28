import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { calculateTotalCost, calculateReasonableInterval } from '../utils/calculations';
import { calculateCapacity, calculateAvailableHours } from '../utils/capacity';
import { safeNumberFormat, safeCurrencyFormat, safePercentFormat, safeGetUnitType } from '../utils/safeAccess';
import { LoadingState } from './LoadingState';
import type { Plant, Product } from '../types';

interface ProductProfitAnalysisProps {
  plant: Plant;
  product: Product;
}

export function ProductProfitAnalysis({ plant, product }: ProductProfitAnalysisProps) {
  const unitType = safeGetUnitType(plant);
  const productConfig = plant.products[product.id];
  if (!productConfig) {
    return (
      <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
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
    ));
  }

  if (!capacity) {
    return (
      <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
        Please configure the production rate or capacity for this product
      </div>
    );
  }

  if (!product.price) {
    return (
      <div className="text-center text-gray-50 py-4 bg-gray-50 rounded-lg">
        Please set a price for this product in the product configuration
      </div>
    );
  }

  // Generate data points for profit analysis
  const data: any[] = [];
  const interval = calculateReasonableInterval(capacity);
  let hasValidData = false;
  let breakEvenPoint;
  
  // Ensure we have at least two points for the chart
  const points = [0];
  for (let i = 1; i <= 20; i++) {
    points.push(Math.floor((i * capacity) / 20));
  }
  if (points[points.length - 1] !== capacity) {
    points.push(capacity);
  }

  for (const units of points) {
    const result = calculateTotalCost({ [product.id]: units }, plant);
    if (typeof result.cost !== 'number' || isNaN(result.cost)) {
      console.warn('Failed to calculate costs for units:', units);
      continue;
    }
    
    const { cost } = result;
    if (cost < 0) continue;

    const revenue = units * product.price;
    const profit = revenue - cost;
    hasValidData = true;
    
    const point = {
      units,
      revenue,
      cost,
      profit,
      profitMargin: units > 0 ? (profit / revenue) * 100 : 0
    };
    
    data.push(point);
    
    // Update break-even point
    if (!breakEvenPoint && profit >= 0 && units > 0) {
      breakEvenPoint = point;
    }
  }

  if (!hasValidData || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
        Unable to calculate profits. Please check cost configuration.
      </div>
    );
  }

  const lastPoint = data[data.length - 1] || {
    units: 0,
    revenue: 0,
    cost: 0,
    profit: 0,
    profitMargin: 0
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Profit Analysis for {product.name} ({unitType}s)
      </h3>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="units"
              tickFormatter={safeNumberFormat}
              label={{
                value: `Production ${plant.settings.unitType}s`,
                position: 'bottom',
                offset: 20
              }}
            />
            <YAxis
              yAxisId="money"
              tickFormatter={safeCurrencyFormat}
              label={{
                value: 'Amount ($)',
                angle: -90,
                position: 'insideLeft',
                offset: -40
              }}
            />
            <YAxis
              yAxisId="margin"
              orientation="right"
              tickFormatter={safePercentFormat}
              label={{
                value: 'Profit Margin (%)',
                angle: 90,
                position: 'insideRight',
                offset: -40
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'profitMargin' ? safePercentFormat(value) : safeCurrencyFormat(value),
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelFormatter={(value) => `${safeNumberFormat(value)} units`}
            />
            <Legend />

            {/* Break-even reference line */}
            {breakEvenPoint && (
              <ReferenceLine
                x={breakEvenPoint.units}
                yAxisId="money"
                stroke="#059669"
                strokeDasharray="3 3"
                label={{
                  value: 'Break-even',
                  position: 'top',
                  fill: '#059669'
                }}
              />
            )}

            <Line
              yAxisId="money"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="money"
              type="monotone"
              dataKey="cost"
              name="Cost"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="money"
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="#059669"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="margin"
              type="monotone"
              dataKey="profitMargin"
              name="Profit Margin"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Break-even Analysis</h4>
          {breakEvenPoint ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-800">Break-even Point:</span>
                <span className="text-blue-900 font-medium">
                  {safeNumberFormat(breakEvenPoint.units)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Break-even Revenue:</span>
                <span className="text-blue-900 font-medium">
                  {safeCurrencyFormat(breakEvenPoint.revenue)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-blue-800">
              No break-even point found within capacity range
            </p>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Maximum Profit Point</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-800">Units:</span>
              <span className="text-green-900 font-medium">
                {safeNumberFormat(capacity)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-800">Revenue:</span>
              <span className="text-green-900 font-medium">
                {safeCurrencyFormat(lastPoint.revenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-800">Profit:</span>
              <span className="text-green-900 font-medium">
                {safeCurrencyFormat(lastPoint.profit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-800">Margin:</span>
              <span className="text-green-900 font-medium">
                {safePercentFormat(lastPoint.profitMargin)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}