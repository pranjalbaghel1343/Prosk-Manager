const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // PostgreSQL specific errors
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry. This record already exists.',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
