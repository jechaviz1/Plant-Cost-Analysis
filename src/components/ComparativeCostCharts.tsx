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
import { calculateTotalCost } from '../utils/calculations';
import type { Plant, Product } from '../types';

const COLORS = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#db2777'];

interface ComparativeCostChartsProps {
  plants: Plant[];
  products: Product[];
  currentProduction: {
    plantId: string;
    units: number;
    products: {
      [productId: string]: {
        units: number;
        revenue: number;
        cost: number;
        profit: number;
      };
    };
  }[];
}

export function ComparativeCostCharts({ 
  plants,
  products,
  currentProduction 
}: ComparativeCostChartsProps) {
  const isSingleProduct = products.length === 1;

  if (!isSingleProduct) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cost Analysis</h2>
        <div className="text-gray-500 text-center py-4">
          Cost comparison charts for multi-product scenarios coming soon.
          This feature will provide detailed cost breakdowns and comparisons across:
          <ul className="list-disc list-inside mt-2 text-left max-w-xl mx-auto">
            <li>Product-specific costs and allocations</li>
            <li>Setup and changeover costs</li>
            <li>Comparative efficiency across plants and products</li>
            <li>Marginal cost analysis for production decisions</li>
          </ul>
        </div>
      </div>
    );
  }

  // Rest of the existing single-product chart implementation...
  return (
    <div className="text-center py-4">
      Single product charts will be displayed here...
    </div>
  );
}