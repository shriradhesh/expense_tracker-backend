import Joi from 'joi';

const categories = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];

export const createExpenseValidation = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  amount: Joi.number().positive().max(9999999).required(),
  category: Joi.string().valid(...categories).required(),
  date: Joi.date().iso().max('now'),
  notes: Joi.string().max(500).allow('', null)
});

export const updateExpenseValidation = Joi.object({
  title: Joi.string().min(1).max(100),
  amount: Joi.number().positive().max(9999999),
  category: Joi.string().valid(...categories),
  date: Joi.date().iso().max('now'),
  notes: Joi.string().max(500).allow('', null)
});

export const expenseQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  startDate: Joi.date().iso().empty('').optional(),
  endDate: Joi.date().iso().empty('').optional(),
  category: Joi.string().valid(...categories).empty('').optional(),
  sortBy: Joi.string().valid('date', 'amount').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});