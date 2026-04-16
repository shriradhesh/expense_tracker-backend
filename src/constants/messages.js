export const MESSAGES = {
  // Auth messages
  REGISTRATION_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_MISSING: 'Access token missing',
  TOKEN_INVALID: 'Invalid or expired token',
  
  // Expense messages
  EXPENSE_CREATED: 'Expense created successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  EXPENSE_NOT_FOUND: 'Expense not found',
  EXPENSES_FETCHED: 'Expenses fetched successfully',
  SUMMARY_FETCHED: 'Summary data fetched successfully',
  
  // Validation messages
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_EMAIL: 'Please provide a valid email address',
  PASSWORD_LENGTH: 'Password must be at least 6 characters long',
  INVALID_AMOUNT: 'Amount must be a positive number',
  INVALID_DATE: 'Please provide a valid date',
  INVALID_CATEGORY: 'Invalid category selected',
  
  // Server messages
  INTERNAL_ERROR: 'Internal server error',
  ROUTE_NOT_FOUND: 'Route not found',
  DATABASE_ERROR: 'Database connection error'
};