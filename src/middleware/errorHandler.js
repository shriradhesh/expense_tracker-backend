import { STATUS_CODES } from '../constants/statusCodes.js';
import { MESSAGES } from '../constants/messages.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(STATUS_CODES.CONFLICT).json({
      success: false,
      message: MESSAGES.EMAIL_ALREADY_EXISTS
    });
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: errors.join(', ')
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.TOKEN_INVALID
    });
  }
  
  res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: MESSAGES.INTERNAL_ERROR
  });
};