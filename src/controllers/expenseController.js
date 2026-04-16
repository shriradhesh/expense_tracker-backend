import Expense from '../models/Expense.js';
import { createExpenseValidation, updateExpenseValidation, expenseQueryValidation } from '../validators/expenseValidator.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { MESSAGES } from '../constants/messages.js';
import mongoose from 'mongoose';

export const getExpenses = async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = expenseQueryValidation.validate(req.query);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { page, limit, startDate, endDate, category, sortBy, sortOrder } = value;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { user: req.user.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (category) {
      query.category = category;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute queries in parallel
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query)
    ]);
    
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.EXPENSES_FETCHED,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

export const createExpense = async (req, res) => {
  try {
    // Validate request body
    const { error } = createExpenseValidation.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const expense = await Expense.create({
      ...req.body,
      user: req.user.id
    });
    
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.EXPENSE_CREATED,
      data: expense
    });
  } catch (error) {
     throw error;
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Invalid expense ID'
      });
    }
    
    // Validate request body
    const { error } = updateExpenseValidation.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const expense = await Expense.findOne({ _id: id, user: req.user.id });
    
    if (!expense) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.EXPENSE_NOT_FOUND
      });
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.EXPENSE_UPDATED,
      data: updatedExpense
    });
  } catch (error) {
    throw error;
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Invalid expense ID'
      });
    }
    
    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user.id });
    
    if (!expense) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.EXPENSE_NOT_FOUND
      });
    }
    
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.EXPENSE_DELETED,
      data: { id }
    });
  } catch (error) {
      throw error;
  }
};

export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    // Build date filter
    const dateFilter = { user: userId };
    
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }
    
    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Execute all aggregations in parallel
    const [monthlyTotal, yearlyTotal, categorySummary] = await Promise.all([
      Expense.aggregate([
        { $match: { ...dateFilter, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { ...dateFilter, date: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
      ])
    ]);
    
    const highestCategory = categorySummary.length > 0 ? categorySummary[0] : null;
    
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.SUMMARY_FETCHED,
      data: {
        monthlyTotal: monthlyTotal[0]?.total || 0,
        yearlyTotal: yearlyTotal[0]?.total || 0,
        highestCategory: highestCategory ? {
          name: highestCategory._id,
          amount: highestCategory.total
        } : null,
        categoryBreakdown: categorySummary.map(cat => ({
          category: cat._id,
          amount: cat.total
        }))
      }
    });
  } catch (error) {
      throw error;
  }
};