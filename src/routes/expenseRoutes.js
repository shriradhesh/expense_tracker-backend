import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary
} from '../controllers/expenseController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .put(updateExpense)
  .delete(deleteExpense);

router.get('/summary', getSummary);

export default router;