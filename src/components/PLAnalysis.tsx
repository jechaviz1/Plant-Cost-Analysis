import React from 'react';
import type { PLAnalysis } from '../types';

interface PLAnalysisTableProps {
  analysis: PLAnalysis[];
  unitType: string;
}

export function PLAnalysisTable({ analysis, unitType }: PLAnalysisTableProps) {
  if (!analysis.length) return null;

  const costIds = Object.keys(analysis[0].costBreakdown);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">P&L Analysis</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {unitType}s
              </th>
              {costIds.map(costId => (
                <React.Fragment key={costId}>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {costId} Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {costId} per {unitType}
                  </th>
                </React.Fragment>
              ))}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost per {unitType}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analysis.map((point) => (
              <tr key={point.units}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {point.units.toLocaleString()}
                </td>
                {costIds.map(costId => (
                  <React.Fragment key={costId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Math.round(point.costBreakdown[costId]).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(point.costBreakdown[costId] / point.units || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  </React.Fragment>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${Math.round(point.totalCost).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-900">
                  ${point.costPerUnit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}