import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import type { Plant } from '../types';

const UNIT_TYPES = ['unit', 'ton', 'lb', 'other'] as const;

interface SettingsProps {
  plant: Plant;
  onChange: (updates: Partial<Plant>) => void;
}

export function Settings({ plant, onChange }: SettingsProps) {
  React.useEffect(() => {
    if (!plant.settings) {
      onChange({
        settings: {
          unitType: 'unit',
          defaultTimeframe: 'year'
        }
      });
    }
  }, []);

  if (!plant.settings) {
    return null;
  }

  const handleSettingChange = (key: keyof Plant['settings'], value: string) => {
    onChange({
      settings: {
        ...plant.settings,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-lg text-white">
        <SettingsIcon className="w-6 h-6" />
        <h2 className="text-xl font-bold">Global Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Production Unit Type
          </label>
          <div className="flex space-x-2">
            <select
              value={plant.settings.unitType}
              onChange={(e) => handleSettingChange('unitType', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {UNIT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {plant.settings.unitType === 'other' && (
              <input
                type="text"
                value={plant.settings.customUnitType || ''}
                onChange={(e) => handleSettingChange('customUnitType', e.target.value)}
                placeholder="Custom unit type"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            This unit type will be used throughout the application for consistency
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Analysis Period
          </label>
          <select
            value={plant.settings.defaultTimeframe}
            onChange={(e) => handleSettingChange('defaultTimeframe', e.target.value as 'month' | 'year')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Determines whether capacity and costs are shown in monthly or yearly terms
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Settings Impact</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Unit type affects all capacity and cost calculations</li>
          <li>Time period determines how rates and capacities are displayed</li>
          <li>Changes apply to all plants for consistency</li>
        </ul>
      </div>
    </div>
  );
}