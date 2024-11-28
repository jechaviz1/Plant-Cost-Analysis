import React from 'react';
import { Clock } from 'lucide-react';
import type { Plant } from '../types';

interface OperatingTimeConfigProps {
  plant: Plant;
  onChange: (updates: Partial<Plant>) => void;
}

export function OperatingTimeConfig({ plant, onChange }: OperatingTimeConfigProps) {
  const handleOperatingTimeChange = (field: keyof Plant['operatingTime'], value: string) => {
    const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
    onChange({
      operatingTime: {
        ...plant.operatingTime,
        [field]: numValue
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Clock className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">Operating Time</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hours per Day
          </label>
          <input
            type="number"
            min="0"
            max="24"
            value={plant.operatingTime.hoursPerDay}
            onChange={(e) => handleOperatingTimeChange('hoursPerDay', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Days per Week
          </label>
          <input
            type="number"
            min="0"
            max="7"
            value={plant.operatingTime.daysPerWeek}
            onChange={(e) => handleOperatingTimeChange('daysPerWeek', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weeks per Year
          </label>
          <input
            type="number"
            min="0"
            max="52"
            value={plant.operatingTime.weeksPerYear}
            onChange={(e) => handleOperatingTimeChange('weeksPerYear', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Available Production Time</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-blue-800">Hours per Year:</span>
            <span className="text-blue-900 font-medium">
              {Math.round(
                plant.operatingTime.hoursPerDay *
                plant.operatingTime.daysPerWeek *
                plant.operatingTime.weeksPerYear
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-800">Days per Year:</span>
            <span className="text-blue-900 font-medium">
              {Math.round(
                plant.operatingTime.daysPerWeek *
                plant.operatingTime.weeksPerYear
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-800">Hours per Day:</span>
            <span className="text-blue-900 font-medium">
              {plant.operatingTime.hoursPerDay.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}