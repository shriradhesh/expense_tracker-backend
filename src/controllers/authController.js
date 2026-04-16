import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { registerValidation, loginValidation } from '../validators/authValidator.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { MESSAGES } from '../constants/messages.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const register = async (req, res) => {
  try {
    // Validate request body
    const { error } = registerValidation.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: MESSAGES.EMAIL_ALREADY_EXISTS
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
    
    const token = generateToken(user._id);
    
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.REGISTRATION_SUCCESS,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
       throw error;
  }
};

export const login = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginValidation.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { email, password } = req.body;
    
    // Check user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    const token = generateToken(user._id);
    
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    throw error;
  }
};