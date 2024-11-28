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
import type { CostPoint } from '../types';

interface CostChartProps {
  data: CostPoint[];
  unitType: string;
  optimalPoint: CostPoint;
}

export function CostChart({ data, unitType, optimalPoint }: CostChartProps) {
  const formatXAxis = (value: number) => Math.round(value).toLocaleString();
  const formatTotalCost = (value: number) => `$${value.toLocaleString()}`;
  const formatCostPerUnit = (value: number) => 
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate cost per unit for each point
  const chartData = data.map(point => ({
    ...point,
    costPerUnit: point.units === 0 ? 0 : point.cost / point.units
  }));

  // Find max values for scaling
  const maxTotalCost = Math.max(...chartData.map(d => d.cost));
  const maxCostPerUnit = Math.max(...chartData.map(d => d.costPerUnit));

  // Adjust margins to prevent label overlap
  const margin = { top: 20, right: 90, left: 90, bottom: 80 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Cost Analysis</h2>
        <div className="text-sm text-gray-500">
          Showing cost curves from 0 to {data[data.length - 1].units.toLocaleString()} {unitType}s
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="units" 
              tickFormatter={formatXAxis}
              label={{ 
                value: `Production (${unitType}s)`, 
                position: 'bottom', 
                offset: 60,
                style: { textAnchor: 'middle' }
              }} 
            />
            <YAxis 
              yAxisId="totalCost"
              tickFormatter={formatTotalCost}
              label={{ 
                value: 'Total Cost ($)', 
                angle: -90, 
                position: 'insideLeft', 
                offset: -70,
                style: { textAnchor: 'middle' }
              }} 
              domain={[0, maxTotalCost * 1.1]}
            />
            <YAxis 
              yAxisId="costPerUnit"
              orientation="right"
              tickFormatter={formatCostPerUnit}
              label={{ 
                value: `Cost per ${unitType} ($)`, 
                angle: 90, 
                position: 'insideRight', 
                offset: -60,
                style: { textAnchor: 'middle' }
              }}
              domain={[0, maxCostPerUnit * 1.1]}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'Total Cost') return [`$${value.toLocaleString()}`, name];
                return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
              }}
              labelFormatter={(value) => `${Math.round(value).toLocaleString()} ${unitType}s`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line 
              yAxisId="totalCost"
              type="monotone" 
              dataKey="cost" 
              stroke="#2563eb" 
              strokeWidth={2}
              name="Total Cost"
              dot={false}
              activeDot={{ r: 8 }}
            />
            <Line 
              yAxisId="costPerUnit"
              type="monotone" 
              dataKey="costPerUnit" 
              stroke="#dc2626" 
              strokeWidth={2}
              name={`Cost per ${unitType}`}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Optimal Production Point</h3>
        <p className="text-blue-800">
          Minimum cost per {unitType} of{' '}
          <span className="font-bold">
            ${(optimalPoint.cost / optimalPoint.units).toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </span>{' '}
          at <span className="font-bold">{Math.round(optimalPoint.units).toLocaleString()} {unitType}s</span>
          <br />
          <span className="text-sm mt-1 block">
            Total cost at optimal point: ${optimalPoint.cost.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
}