import React from 'react';
import type { Plant, Product, OptimizationResult } from '../types';

interface AlternativeScenariosProps {
  plants: Plant[];
  products: Product[];
  result: OptimizationResult;
}

export function AlternativeScenarios({
  plants,
  products,
  result
}: AlternativeScenariosProps) {
  const isSingleProduct = products.length === 1;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Alternative Production Scenarios</h2>
      
      {isSingleProduct ? (
        <div className="text-gray-500 text-center py-4">
          Alternative scenarios are automatically calculated for single-product configurations.
          Add more products to see multi-product optimization scenarios.
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          Multi-product alternative scenarios coming soon.
          This feature will help optimize production across multiple products considering:
          <ul className="list-disc list-inside mt-2 text-left max-w-xl mx-auto">
            <li>Setup costs and changeover times between products</li>
            <li>Product-specific demand constraints</li>
            <li>Cost allocations across products</li>
            <li>Production sequencing optimization</li>
          </ul>
        </div>
      )}
    </div>
  );
}