import { FieldValue } from "firebase/firestore";

// Time Units
export type TimeUnit = 'hour' | 'day' | 'week' | 'month' | 'year';

// Cost Types
export interface StepFunctionRange {
  id: string;
  startUnits: number;
  endUnits: number;
  fixedCost?: number;
  costPerUnit?: number;
}

export interface ProductSpecificRate {
  productId: string;
  costPerUnit: number;
  rangeId?: string;
}

export interface Cost {
  id: string;
  name: string;
  type: 'fixed' | 'variable' | 'semi-variable' | 'step-function';
  allocationType: 'plant-wide' | 'product-specific';
  // For fixed costs
  amount?: number;
  // For variable costs
  costPerUnit?: number;
  productSpecificRates?: ProductSpecificRate[];
  // For semi-variable costs
  baseUnits?: number;
  baseCost?: number;
  scaleFactor?: number;
  // For step function costs
  ranges?: StepFunctionRange[];
  stepType?: 'fixed' | 'variable';
  productRangeRates?: ProductSpecificRate[];
  // For product-specific costs
  specificToProduct?: string; // Product ID this cost applies to
  productAllocations?: { [key: string]: number };
}

// Product Types
export interface Product {
  id: string;
  name: string;
  price: number;
  demand: number;
  minProduction?: number;
}

// Plant Types
export interface Plant {
  id: string;
  name: string;
  settings: {
    unitType: 'unit' | 'ton' | 'lb' | 'other';
    customUnitType: string;
    defaultTimeframe: 'month' | 'year';
  };
  costs: Cost[];
  capacityMode: 'fixed' | 'rate';
  capacity?: number;
  operatingTime: {
    hoursPerDay: number;
    daysPerWeek: number;
    weeksPerYear: number;
  };
  products: {
    [productId: string]: {
      capacity?: number;
      rate?: {
        units: number;
        timeUnit: TimeUnit;
      };
      setupCost?: number;
      changeover?: {
        [fromProductId: string]: {
          time: number;
          cost: number;
        };
      };
    };
  };
}

// Analysis Types
export interface CostPoint {
  units: number;
  cost: number;
  breakdown: Record<string, number>;
}

export interface PLAnalysis {
  units: number;
  totalCost: number;
  costBreakdown: Record<string, number>;
  costPerUnit: number;
  products?: {
    [productId: string]: {
      units: number;
      revenue: number;
      cost: number;
      profit: number;
      costPerUnit: number;
    };
  };
}

// Optimization Types
export interface OptimizationResult {
  plantAllocations: {
    plantId: string;
    units: number;
    capacity: number;
    capacityUtilization: number;
    products: {
      [productId: string]: {
        units: number;
        revenue: number;
        cost: number;
        profit: number;
      };
    };
    cost: number;
    revenue: number;
    profit: number;
  }[];
  totalUnits: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  totalCapacity: number;
  productTotals: {
    [productId: string]: {
      units: number;
      revenue: number;
      cost: number;
      profit: number;
      demandMet: boolean;
    };
  };
}

// Sharing Types
export interface SharedUser {
  uid: string;
  email: string;
  role: 'viewer' | 'editor';
}

export interface ConfigurationMeta {
  id: string;
  name: string;
  config: PlantConfig;
  userId: string;
  createdAt: string;
  updatedAt?: string | FieldValue;
  sharedWith: SharedUser[];
  isPublic?: boolean;
}

export type PlantConfig = {
  plants: Plant[];
  products: Product[];
  semiVariableCost: {
    baseUnits: number;
    baseCost: number;
    scaleFactor: number;
  };
  capacity: number;
  unitType: string;
  fixedCost: number;
  variableCostPerUnit: number;
  manualCostPoints: ManualCostPoint[];
};

export type ManualCostPoint = {
  id: string;
  units: number;
  cost: number;
};