import { Request, Response } from 'express';

export interface MedicineItem {
  id: string;
  name: string;
  category: 'Maternal & Child' | 'Antibiotics' | 'Chronic NCD' | 'Analgesics' | 'Emergency';
  form: 'Tablet' | 'Syrup' | 'Injection' | 'Sachet';
  facilityId: string;
  facilityName: string;
  stockLevel: number;
  unit: string;
  reorderThreshold: number;
  status: 'ADEQUATE' | 'LOW' | 'STOCKOUT';
  lastUpdated: string;
}

const inventoryStore: Map<string, MedicineItem> = new Map();

const seedInitialMedicines = () => {
  if (inventoryStore.size > 0) return;

  const demoItems: MedicineItem[] = [
    {
      id: 'med-ifa-angara',
      name: 'Iron & Folic Acid (IFA) Tablets',
      category: 'Maternal & Child',
      form: 'Tablet',
      facilityId: 'phc-angara',
      facilityName: 'Angara Primary Health Centre',
      stockLevel: 1400,
      unit: 'tablets',
      reorderThreshold: 500,
      status: 'ADEQUATE',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'med-oxy-angara',
      name: 'Oxytocin 10 IU Injection',
      category: 'Emergency',
      form: 'Injection',
      facilityId: 'phc-angara',
      facilityName: 'Angara Primary Health Centre',
      stockLevel: 12,
      unit: 'ampoules',
      reorderThreshold: 20,
      status: 'LOW',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'med-met-angara',
      name: 'Metformin 500mg',
      category: 'Chronic NCD',
      form: 'Tablet',
      facilityId: 'phc-angara',
      facilityName: 'Angara Primary Health Centre',
      stockLevel: 0,
      unit: 'strips',
      reorderThreshold: 100,
      status: 'STOCKOUT',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'med-amlo-angara',
      name: 'Amlodipine 5mg',
      category: 'Chronic NCD',
      form: 'Tablet',
      facilityId: 'phc-angara',
      facilityName: 'Angara Primary Health Centre',
      stockLevel: 80,
      unit: 'strips',
      reorderThreshold: 100,
      status: 'LOW',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'med-ors-angara',
      name: 'Oral Rehydration Salts (ORS) Sachet',
      category: 'Maternal & Child',
      form: 'Sachet',
      facilityId: 'phc-angara',
      facilityName: 'Angara Primary Health Centre',
      stockLevel: 650,
      unit: 'sachets',
      reorderThreshold: 200,
      status: 'ADEQUATE',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'med-met-dh',
      name: 'Metformin 500mg',
      category: 'Chronic NCD',
      form: 'Tablet',
      facilityId: 'dh-ranchi',
      facilityName: 'Ranchi District Hospital',
      stockLevel: 5200,
      unit: 'strips',
      reorderThreshold: 500,
      status: 'ADEQUATE',
      lastUpdated: new Date().toISOString(),
    },
  ];

  demoItems.forEach((item) => inventoryStore.set(item.id, item));
};

seedInitialMedicines();

export const getMedicineInventory = async (req: Request, res: Response): Promise<void> => {
  seedInitialMedicines();
  const { facilityId, status, category } = req.query;

  let list = Array.from(inventoryStore.values());
  if (facilityId) {
    list = list.filter((i) => i.facilityId === facilityId);
  }
  if (status) {
    list = list.filter((i) => i.status === status);
  }
  if (category) {
    list = list.filter((i) => i.category === category);
  }

  const stockoutCount = list.filter((i) => i.status === 'STOCKOUT').length;
  const lowStockCount = list.filter((i) => i.status === 'LOW').length;

  res.json({
    success: true,
    totalItems: list.length,
    stockoutCount,
    lowStockCount,
    inventory: list,
  });
};

export const updateMedicineStock = async (req: Request, res: Response): Promise<void> => {
  seedInitialMedicines();
  const id = String(req.params.id);
  const { stockLevel, delta } = req.body;

  const item = inventoryStore.get(id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Medicine item not found.' });
    return;
  }

  let newLevel = item.stockLevel;
  if (stockLevel !== undefined) {
    newLevel = Number(stockLevel);
  } else if (delta !== undefined) {
    newLevel += Number(delta);
  }

  item.stockLevel = Math.max(0, newLevel);
  if (item.stockLevel === 0) {
    item.status = 'STOCKOUT';
  } else if (item.stockLevel <= item.reorderThreshold) {
    item.status = 'LOW';
  } else {
    item.status = 'ADEQUATE';
  }

  item.lastUpdated = new Date().toISOString();
  inventoryStore.set(id, item);

  res.json({
    success: true,
    message: 'Medicine inventory updated successfully.',
    item,
  });
};
