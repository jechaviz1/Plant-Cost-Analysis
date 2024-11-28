import React from 'react';
import { Plus, Minus, Factory } from 'lucide-react';
import type { PlantConfig } from '../types';

interface ConfigFormProps {
  config: PlantConfig;
  onChange: (config: PlantConfig) => void;
}

export function ConfigForm({ config, onChange }: ConfigFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newConfig = { ...config };

    if (name.startsWith('semiVariableCost.')) {
      const field = name.split('.')[1];
      newConfig.semiVariableCost = {
        ...newConfig.semiVariableCost,
        [field]: parseFloat(value) || 0
      };
    } else {
      (newConfig as any)[name] = name === 'unitType' ? value : (parseFloat(value) || 0);
    }

    onChange(newConfig);
  };

  const addManualPoint = () => {
    onChange({
      ...config,
      manualCostPoints: [
        ...config.manualCostPoints,
        { units: 0, cost: 0, id: crypto.randomUUID() }
      ]
    });
  };

  const removeManualPoint = (id: string) => {
    onChange({
      ...config,
      manualCostPoints: config.manualCostPoints.filter(point => point.id !== id)
    });
  };

  const updateManualPoint = (id: string, field: 'units' | 'cost', value: number) => {
    onChange({
      ...config,
      manualCostPoints: config.manualCostPoints.map(point =>
        point.id === id ? { ...point, [field]: value } : point
      )
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-lg text-white">
        <Factory className="w-6 h-6" />
        <h2 className="text-xl font-bold">Plant Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Capacity</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                name="capacity"
                value={config.capacity}
                onChange={handleChange}
                className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <input
                type="text"
                name="unitType"
                value={config.unitType}
                onChange={handleChange}
                placeholder="units"
                className="rounded-r-md border-l-0 border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fixed Cost ($)</label>
            <input
              type="number"
              name="fixedCost"
              value={config.fixedCost}
              onChange={handleChange}
              className="c-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Variable Cost per Unit ($)</label>
            <input
              type="number"
              name="variableCostPerUnit"
              value={config.variableCostPerUnit}
              onChange={handleChange}
              className="c-input"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Semi-Variable Cost</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Units</label>
                <input
                  type="number"
                  name="semiVariableCost.baseUnits"
                  value={config.semiVariableCost.baseUnits}
                  onChange={handleChange}
                  className="c-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Cost ($)</label>
                <input
                  type="number"
                  name="semiVariableCost.baseCost"
                  value={config.semiVariableCost.baseCost}
                  onChange={handleChange}
                  className="c-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scale Factor</label>
                <input
                  type="number"
                  name="semiVariableCost.scaleFactor"
                  value={config.semiVariableCost.scaleFactor}
                  onChange={handleChange}
                  step="0.1"
                  className="c-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Manual Cost Points</h3>
          <button
            type="button"
            onClick={addManualPoint}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Point
          </button>
        </div>

        <div className="space-y-2">
          {config.manualCostPoints.map((point) => (
            <div key={point.id} className="flex items-center space-x-4">
              <input
                type="number"
                value={point.units}
                onChange={(e) => updateManualPoint(point.id, 'units', parseFloat(e.target.value) || 0)}
                placeholder="Units"
                className="c-input"
              />
              <input
                type="number"
                value={point.cost}
                onChange={(e) => updateManualPoint(point.id, 'cost', parseFloat(e.target.value) || 0)}
                placeholder="Cost ($)"
                className="c-input"
              />
              <button
                type="button"
                onClick={() => removeManualPoint(point.id)}
                className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}