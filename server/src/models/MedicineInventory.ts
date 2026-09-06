import { createSQLModel } from '../database/sqlModel.js';

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock' | 'discontinued';

export interface IMedicineInventory {
  _id?: any;
  id?: any;
  hospitalId: any;
  hospitalName?: string;
  // Medicine info
  medicineName: string;
  genericName?: string;
  brandNames?: string[];
  category?: string; // e.g., 'Antibiotic', 'Analgesic', 'Antihypertensive'
  formulation?: string; // e.g., 'Tablet', 'Syrup', 'Injection'
  strength?: string; // e.g., '500mg', '250ml'
  // Stock
  quantity: number;
  unit?: string; // e.g., 'tablets', 'vials', 'bottles'
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  stockStatus: StockStatus;
  // Pricing
  pricePerUnit?: number;
  isFree?: boolean; // Government scheme
  // Metadata
  expiryDate?: string | Date;
  batchNumber?: string;
  manufacturer?: string;
  lastRestockedAt?: string | Date;
  lastRestockedBy?: string;
  // Notes
  notes?: string;
  prescriptionRequired?: boolean;
  governmentScheme?: string; // e.g., 'PM Jan Aushadhi', 'NHSRC'
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const MedicineInventory: any = createSQLModel<IMedicineInventory>('medicine_inventory');
