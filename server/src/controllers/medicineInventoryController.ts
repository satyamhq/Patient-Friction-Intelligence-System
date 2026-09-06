import { Request, Response } from 'express';
import { MedicineInventory, IMedicineInventory } from '../models/MedicineInventory.js';

export const getMedicineInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facilityId, hospitalId, status, category, search } = req.query;

    let filter: any = {};
    const targetHospitalId = facilityId || hospitalId;
    if (targetHospitalId) {
      filter.hospitalId = targetHospitalId;
    }
    if (status) {
      // Map frontend status if needed
      if (status === 'STOCKOUT') filter.stockStatus = 'out_of_stock';
      else if (status === 'LOW') filter.stockStatus = 'low_stock';
      else if (status === 'ADEQUATE') filter.stockStatus = 'available';
      else filter.stockStatus = status;
    }
    if (category) {
      filter.category = category;
    }

    let items: any[] = await MedicineInventory.find(filter);

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (i) =>
          (i.medicineName && i.medicineName.toLowerCase().includes(q)) ||
          (i.genericName && i.genericName.toLowerCase().includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q))
      );
    }

    // Normalized items for client compatibility
    const normalized = items.map((i) => ({
      id: i.id || i._id,
      _id: i._id || i.id,
      name: i.medicineName,
      medicineName: i.medicineName,
      genericName: i.genericName,
      category: i.category,
      form: i.formulation || 'Tablet',
      formulation: i.formulation || 'Tablet',
      strength: i.strength,
      facilityId: i.hospitalId,
      hospitalId: i.hospitalId,
      facilityName: i.hospitalName || 'Health Facility',
      hospitalName: i.hospitalName || 'Health Facility',
      stockLevel: i.quantity,
      quantity: i.quantity,
      unit: i.unit || 'units',
      reorderThreshold: i.minimumStockLevel || 100,
      minimumStockLevel: i.minimumStockLevel || 100,
      status: i.stockStatus === 'out_of_stock' ? 'STOCKOUT' : i.stockStatus === 'low_stock' ? 'LOW' : 'ADEQUATE',
      stockStatus: i.stockStatus,
      isFree: i.isFree,
      governmentScheme: i.governmentScheme,
      lastUpdated: i.updatedAt || i.createdAt || new Date().toISOString(),
    }));

    const stockoutCount = normalized.filter((i) => i.status === 'STOCKOUT').length;
    const lowStockCount = normalized.filter((i) => i.status === 'LOW').length;

    res.json({
      success: true,
      totalItems: normalized.length,
      stockoutCount,
      lowStockCount,
      inventory: normalized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch medicine inventory' });
  }
};

export const updateMedicineStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { stockLevel, quantity, delta } = req.body;

    const item = await MedicineInventory.findOne({ $or: [{ id }, { _id: id }] });
    if (!item) {
      res.status(404).json({ success: false, message: 'Medicine item not found in database.' });
      return;
    }

    let newLevel = item.quantity;
    if (stockLevel !== undefined) {
      newLevel = Number(stockLevel);
    } else if (quantity !== undefined) {
      newLevel = Number(quantity);
    } else if (delta !== undefined) {
      newLevel += Number(delta);
    }

    newLevel = Math.max(0, newLevel);
    const minThreshold = item.minimumStockLevel || 100;

    let stockStatus = 'available';
    if (newLevel === 0) {
      stockStatus = 'out_of_stock';
    } else if (newLevel <= minThreshold) {
      stockStatus = 'low_stock';
    }

    const now = new Date().toISOString();
    await MedicineInventory.findByIdAndUpdate(
      item.id || item._id,
      {
        quantity: newLevel,
        stockStatus,
        updatedAt: now,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Medicine inventory updated successfully.',
      item: {
        ...item,
        quantity: newLevel,
        stockLevel: newLevel,
        stockStatus,
        status: stockStatus === 'out_of_stock' ? 'STOCKOUT' : stockStatus === 'low_stock' ? 'LOW' : 'ADEQUATE',
        lastUpdated: now,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update medicine stock' });
  }
};

export const addMedicineItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      hospitalId,
      hospitalName,
      medicineName,
      genericName,
      category,
      formulation,
      strength,
      quantity = 0,
      unit = 'tablets',
      minimumStockLevel = 50,
      isFree = true,
      governmentScheme,
      prescriptionRequired = false,
    } = req.body;

    if (!hospitalId || !medicineName) {
      res.status(400).json({ success: false, message: 'hospitalId and medicineName are required.' });
      return;
    }

    const qty = Number(quantity);
    let stockStatus = 'available';
    if (qty === 0) stockStatus = 'out_of_stock';
    else if (qty <= minimumStockLevel) stockStatus = 'low_stock';

    const now = new Date().toISOString();
    const created = await MedicineInventory.create({
      hospitalId,
      hospitalName: hospitalName || 'Health Facility',
      medicineName,
      genericName,
      category: category || 'General',
      formulation: formulation || 'Tablet',
      strength,
      quantity: qty,
      unit,
      minimumStockLevel,
      stockStatus,
      isFree,
      governmentScheme,
      prescriptionRequired,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory.',
      item: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add medicine item' });
  }
};
