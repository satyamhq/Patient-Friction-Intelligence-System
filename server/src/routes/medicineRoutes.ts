import { Router } from 'express';
import { getMedicineInventory, updateMedicineStock, addMedicineItem } from '../controllers/medicineInventoryController.js';

const router = Router();

router.get('/', getMedicineInventory);
router.post('/', addMedicineItem);
router.patch('/:id/stock', updateMedicineStock);
router.put('/:id/stock', updateMedicineStock);

export default router;
