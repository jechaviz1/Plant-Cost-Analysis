import { useState, useEffect } from 'react';
import { Layout } from 'lucide-react';
import { CostForm } from './cost-form';
import { ProductCapacityConfig } from './ProductCapacityConfig';
import { ProductAnalysis } from './ProductAnalysis';
import { PlantProductManagement } from './PlantProductManagement';
import type { Plant, Product } from '../types';

interface PlantAnalysisProps {
  plant: Plant;
  products: Product[];
  onChange: (updates: Partial<Plant>) => void;
  onProductsChange: (products: Product[]) => void;
}

export function PlantAnalysis({
  plant,
  products,
  onChange,
  onProductsChange
}: PlantAnalysisProps) {
  // Ensure plant has settings initialized
  useEffect(() => {
    if (!plant.settings) {
      onChange({
        settings: {
          unitType: 'unit',
          customUnitType: 'custom',
          defaultTimeframe: 'year'
        }
      });
    }
  }, [plant]);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products.length > 0 ? products[0].id : null
  );

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: 'New Product',
      price: 0,
      demand: 0
    };
    onProductsChange([...products, newProduct]);
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    onProductsChange(products.map(p =>
      p.id === productId ? { ...p, ...updates } : p
    ));
  };

  const handleRemoveProduct = (productId: string) => {
    onProductsChange(products.filter(p => p.id !== productId));
    if (selectedProductId === productId) {
      setSelectedProductId(products[0]?.id || null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
        <PlantProductManagement
          plant={plant}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onRemoveProduct={handleRemoveProduct}
        />
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
        <ProductCapacityConfig
          plant={plant}
          products={products}
          onChange={onChange}
        />
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
        <CostForm
          config={plant}
          onChange={onChange}
          products={products}
        />
      </div>

      {products.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Layout className="w-5 h-5 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Select Product for Analysis
            </label>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  selectedProductId === product.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {product.name}
              </button>
            ))}
          </div>

          {selectedProductId && (
            <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
              <ProductAnalysis
                plant={plant}
                product={products.find(p => p.id === selectedProductId)!}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-100">
          <div className="text-center text-gray-500">
            Add products to see analysis
          </div>
        </div>
      )}
    </div>
  );
}