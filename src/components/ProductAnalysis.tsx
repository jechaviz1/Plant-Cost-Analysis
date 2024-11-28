import React from 'react';
import { ProductCostAnalysis } from './ProductCostAnalysis';
import { ProductProfitAnalysis } from './ProductProfitAnalysis';
import type { Plant, Product } from '../types';

interface ProductAnalysisProps {
  plant: Plant;
  product: Product;
}

export function ProductAnalysis({ plant, product }: ProductAnalysisProps) {
  if (!plant || !product) {
    return (
      <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
        Unable to analyze product. Please check configuration.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
        <ProductCostAnalysis 
          plant={plant} 
          product={product} 
        />
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
        <ProductProfitAnalysis 
          plant={plant} 
          product={product} 
        />
      </div>
    </div>
  );
}