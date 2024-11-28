import React, { useState, useEffect } from 'react';
import { Factory, Save } from 'lucide-react';
import { CostForm } from './components/CostForm';
import { PlantTabs } from './components/PlantTabs';
import { TotalAnalysis } from './components/TotalAnalysis';
import { AuthButton } from './components/AuthButton';
import { SaveConfigModal } from './components/SaveConfigModal';
import { ConfigurationsList } from './components/ConfigurationsList';
import { ProductManagement } from './components/ProductManagement';
import { PlantAnalysis } from './components/PlantAnalysis';
import { Notification } from './components/Notification';
import { Settings } from './components/Settings';
import { useConfigurations } from './hooks/useConfigurations';
import { useAuth } from './contexts/AuthContext';
import { optimizeProduction } from './utils/optimization';
import type { Plant, Product } from './types';

const createDefaultPlant = (): Plant => ({
  id: crypto.randomUUID(),
  name: 'Plant 1',
  settings: {
    unitType: 'unit',
    defaultTimeframe: 'year'
  },
  costs: [],
  capacityMode: 'rate',
  operatingTime: {
    hoursPerDay: 8,
    daysPerWeek: 5,
    weeksPerYear: 50
  },
  products: {}
});

const createDefaultProduct = (): Product => ({
  id: crypto.randomUUID(),
  name: 'Product 1',
  price: 0,
  demand: 0
});

export default function App() {
  const [config, setConfig] = useState<{
    plants: Plant[];
    products: Product[];
  }>({
    plants: [createDefaultPlant()],
    products: [createDefaultProduct()]
  });

  const [activePlantId, setActivePlantId] = useState<string | 'total' | 'settings'>(config.plants[0].id);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [currentConfigName, setCurrentConfigName] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { user } = useAuth();
  const { saveConfiguration, updateConfiguration, configurations, lastConfigId } = useConfigurations();

  // Load last configuration when app starts
  useEffect(() => {
    if (user && lastConfigId && configurations.length > 0) {
      const lastConfig = configurations.find(c => c.id === lastConfigId);
      if (lastConfig) {
        handleLoadConfig(lastConfig.config, lastConfig.id, lastConfig.name);
      }
    }
  }, [user, lastConfigId, configurations]);

  const handleLoadConfig = (loadedConfig: any, configId: string, name: string) => {
    setConfig(loadedConfig);
    setCurrentConfigId(configId);
    setCurrentConfigName(name);
    setActivePlantId(loadedConfig.plants[0].id);
  };

  const handleNewConfig = () => {
    const newConfig = {
      plants: [createDefaultPlant()],
      products: [createDefaultProduct()]
    };
    setConfig(newConfig);
    setCurrentConfigId(null);
    setCurrentConfigName('');
    setActivePlantId(newConfig.plants[0].id);
  };

  const handleUpdateConfig = async () => {
    if (!currentConfigId) {
      console.error('Cannot update: no current configuration selected');
      return;
    }
    try {
      await updateConfiguration(currentConfigId, currentConfigName, config);
      setNotification({
        message: 'Configuration updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating configuration:', error);
      setNotification({
        message: 'Failed to update configuration',
        type: 'error'
      });
    }
  };

  const handleSaveAsNew = () => {
    setIsSaveModalOpen(true);
  };

  const handleAddPlant = () => {
    const newPlant = createDefaultPlant();
    newPlant.name = `Plant ${config.plants.length + 1}`;
    newPlant.settings = { ...config.plants[0].settings };
    setConfig(prev => ({
      ...prev,
      plants: [...prev.plants, newPlant]
    }));
    setActivePlantId(newPlant.id);
  };

  const handleClonePlant = (sourcePlant: Plant) => {
    const clonedPlant: Plant = {
      ...sourcePlant,
      id: crypto.randomUUID(),
      name: `${sourcePlant.name} (Copy)`,
      costs: sourcePlant.costs.map(cost => ({
        ...cost,
        id: crypto.randomUUID()
      }))
    };
    
    setConfig(prev => ({
      ...prev,
      plants: [...prev.plants, clonedPlant]
    }));
    setActivePlantId(clonedPlant.id);
  };

  const handleRemovePlant = (plantId: string) => {
    setConfig(prev => ({
      ...prev,
      plants: prev.plants.filter(p => p.id !== plantId)
    }));
    if (activePlantId === plantId) {
      setActivePlantId(config.plants[0].id);
    }
  };

  const handleUpdatePlant = (plantId: string, updates: Partial<Plant>) => {
    setConfig(prev => ({
      ...prev,
      plants: prev.plants.map(p => 
        p.id === plantId ? { ...p, ...updates } : p
      )
    }));
  };

  const handleUpdateProducts = (products: Product[]) => {
    setConfig(prev => ({
      ...prev,
      products
    }));
  };

  const optimizationResult = config.plants.length > 1
    ? optimizeProduction(config.plants, config.products)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Factory className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Plant Cost Analysis</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex space-x-2">
                {currentConfigId && (
                  <button
                    onClick={handleUpdateConfig}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Configuration
                  </button>
                )}
                <button
                  onClick={handleSaveAsNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save As New
                </button>
              </div>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {user && (
            <div className="lg:col-span-1">
              <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
                <ConfigurationsList
                  onLoad={handleLoadConfig}
                  onNew={handleNewConfig}
                  onEdit={(id, name) => {
                    setCurrentConfigId(id);
                    setCurrentConfigName(name);
                    setIsSaveModalOpen(true);
                  }}
                  currentConfigId={currentConfigId}
                />
              </div>
            </div>
          )}

          <div className={`space-y-8 ${user ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <PlantTabs
              plants={config.plants}
              activePlantId={activePlantId}
              onTabChange={setActivePlantId}
              onAddPlant={handleAddPlant}
              onClonePlant={handleClonePlant}
              onRemovePlant={handleRemovePlant}
            />

            <div className="space-y-8">
              {activePlantId === 'settings' ? (
                <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
                  <Settings 
                    plant={config.plants[0]} 
                    onChange={(updates) => handleUpdatePlant(config.plants[0].id, updates)} 
                  />
                </div>
              ) : activePlantId === 'total' && optimizationResult ? (
                  <TotalAnalysis
                    result={optimizationResult}
                    plants={config.plants}
                    products={config.products}
                    onTotalCapacityChange={(totalCapacity) => {
                      setConfig(prev => ({
                        ...prev,
                        products: prev.products.map(p => ({
                          ...p,
                          demand: Math.floor(totalCapacity / prev.products.length)
                        }))
                      }));
                    }}
                  />
                ) : (
                  <PlantAnalysis
                    plant={config.plants.find(p => p.id === activePlantId)!}
                    products={config.products}
                    onChange={(updates) => handleUpdatePlant(activePlantId, updates)}
                    onProductsChange={handleUpdateProducts}
                  />
                )}
            </div>
          </div>
        </div>
      </main>

      <SaveConfigModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          if (!currentConfigId) {
            setCurrentConfigName('');
          }
        }}
        onSave={async (name) => {
          try {
            if (currentConfigId) {
              await updateConfiguration(currentConfigId, name, config);
              setNotification({
                message: 'Configuration updated successfully',
                type: 'success'
              });
              localStorage.setItem('lastConfigurationId', currentConfigId);
            } else {
              const newId = await saveConfiguration(name, config);
              setCurrentConfigId(newId);
              setCurrentConfigName(name);
              setNotification({
                message: 'Configuration saved successfully',
                type: 'success'
              });
            }
            setIsSaveModalOpen(false);
          } catch (error) {
            setNotification({
              message: 'Failed to save configuration',
              type: 'error'
            });
          }
        }}
        existingName={currentConfigName}
        isUpdate={!!currentConfigId}
      />
    </div>
  );
}