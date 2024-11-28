import React, { useState } from 'react';
import { Plus, X, Copy, Settings as SettingsIcon } from 'lucide-react';
import type { Plant } from '../types';

interface PlantTabsProps {
  plants: Plant[];
  activePlantId: string | 'total' | 'settings';
  onTabChange: (id: string | 'total' | 'settings') => void;
  onAddPlant: () => void;
  onClonePlant: (sourcePlant: Plant) => void;
  onRemovePlant: (id: string) => void;
}

interface ClonePlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (plant: Plant) => void;
  plants: Plant[];
}

function ClonePlantModal({ isOpen, onClose, onSelect, plants }: ClonePlantModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Select Plant to Clone</h3>
        <div className="space-y-2">
          {plants.map(plant => (
            <button
              key={plant.id}
              onClick={() => {
                onSelect(plant);
                onClose();
              }}
              className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium">{plant.name}</div>
              <div className="text-sm text-gray-500">
                Capacity: {plant.capacity.toLocaleString()} {plant.settings.unitType === 'other' ? plant.settings.customUnitType || 'unit' : plant.settings.unitType}s
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlantTabs({ 
  plants, 
  activePlantId, 
  onTabChange, 
  onAddPlant,
  onClonePlant,
  onRemovePlant
}: PlantTabsProps) {
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const showTotalTab = plants.length > 1;

  return (
    <>
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => onTabChange('settings')}
            className={`
              inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium
              ${activePlantId === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </button>
          {showTotalTab && (
            <button
              onClick={() => onTabChange('total')}
              className={`
                inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium
                ${activePlantId === 'total'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Total Analysis
            </button>
          )}
          {plants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => onTabChange(plant.id)}
              className={`
                inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium
                ${activePlantId === plant.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {plant.name || 'Unnamed Plant'}
              {plants.length > 1 && (
                <X
                  className="w-4 h-4 ml-2 text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlant(plant.id);
                  }}
                />
              )}
            </button>
          ))}
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddPlant}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Plant
            </button>
            <button
              onClick={() => setIsCloneModalOpen(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Copy className="w-4 h-4 mr-1" />
              Clone Plant
            </button>
          </div>
        </div>
      </div>

      <ClonePlantModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onSelect={onClonePlant}
        plants={plants}
      />
    </>
  );
}