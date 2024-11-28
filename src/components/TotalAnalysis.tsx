import { useState } from 'react';
import { ComparativeCostCharts } from './ComparativeCostCharts';
import { ProductionAdjustment } from './ProductionAdjustment';
import { AlternativeScenarios } from './AlternativeScenarios';
import type { Plant, Product, OptimizationResult } from '../types';

interface TotalAnalysisProps {
  result: OptimizationResult;
  plants: Plant[];
  products: Product[];
  onTotalCapacityChange: (capacity: number) => void;
}

export function TotalAnalysis({
  result,
  plants,
  products,
  // onTotalCapacityChange
}: TotalAnalysisProps) {
  const [manualAllocations, setManualAllocations] = useState(result.plantAllocations.map(a => ({
    plantId: a.plantId,
    units: a.units,
    products: a.products
  })));

  // const handleTotalCapacityChange = (value: string) => {
  //   const numValue = parseInt(value.replace(/[^\d]/g, ''));
  //   if (!isNaN(numValue)) {
  //     onTotalCapacityChange(numValue);
  //   }
  // };

  const isSingleProduct = products.length <= 1;
  const defaultProduct = products[0];

  return (
    <div className="space-y-8">
      {isSingleProduct ? (
        // Single Product View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per {plants[0].settings.unitType} ($)
            </label>
            <input
              type="text"
              value={defaultProduct?.price.toLocaleString() ?? '0'}
              className="c-input bg-gray-100"
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">
              Price can be adjusted in the Products tab
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Demand ({plants[0].settings.unitType}s)
            </label>
            <input
              type="text"
              value={defaultProduct?.demand.toLocaleString() ?? '0'}
              className="c-input bg-gray-100"
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">
              Demand can be adjusted in the Products tab
            </p>
          </div>
        </div>
      ) : (
        // Multi-Product Summary
        <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Product Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand Met
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => {
                  const totals = result.productTotals[product.id];
                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.demand.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totals.units.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          totals.demandMet
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {totals.demandMet ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Optimal Production Analysis</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Units</div>
              <div className="text-2xl font-bold text-blue-900">
                {result.totalUnits.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Revenue</div>
              <div className="text-2xl font-bold text-green-900">
                ${result.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Total Cost</div>
              <div className="text-2xl font-bold text-red-900">
                ${result.totalCost.toLocaleString()}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Profit</div>
              <div className="text-2xl font-bold text-purple-900">
                ${result.totalProfit.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.plantAllocations.map((allocation) => {
                  const plant = plants.find(p => p.id === allocation.plantId)!;
                  return (
                    <tr key={allocation.plantId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {plant.name}
                        </div>
                        {!isSingleProduct && (
                          <div className="mt-1 text-xs text-gray-500">
                            {Object.entries(allocation.products).map(([productId, data]) => {
                              const product = products.find(p => p.id === productId)!;
                              return data.units > 0 ? (
                                <div key={productId}>
                                  {product.name}: {data.units.toLocaleString()} units
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {allocation.units.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {allocation.capacity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${allocation.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${allocation.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${allocation.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {allocation.capacityUtilization.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductionAdjustment
        plants={plants}
        products={products}
        allocations={manualAllocations}
        onAllocationsChange={setManualAllocations}
        onReset={() => setManualAllocations(result.plantAllocations.map(a => ({
          plantId: a.plantId,
          units: a.units,
          products: a.products
        })))}
      />

      <ComparativeCostCharts
        plants={plants}
        products={products}
        currentProduction={manualAllocations}
      />

      <AlternativeScenarios
        plants={plants}
        products={products}
        result={result}
      />
    </div>
  );
}