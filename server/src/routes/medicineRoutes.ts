import { Router } from 'express';
import { getMedicineInventory, updateMedicineStock } from '../controllers/medicineInventoryController.js';

const router = Router();

router.get('/', getMedicineInventory);
router.patch('/:id/stock', updateMedicineStock);

export default router;
