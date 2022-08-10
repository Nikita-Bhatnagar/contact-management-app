const AppError = require("../utils/AppError");

const handleDuplicateKeyError = (err) => {
  const key = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[key];

  const message = `Duplicate field value for ${key}: ${value}. Please use another value.`;
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  let errors = [];
  for (let key in err.errors) errors.push(err.errors[key].properties.message);
  const message = `Invalid input data: ${errors.join(", ")}`;
  return new AppError(message, 400);
};

const handleJWTExpiredError = (err) => {
  return new AppError("Your token has expired.Please log in again.", 401);
};

const handleInvalidJWTError = (err) => {
  return new AppError("Invalid token. Please log in again.", 401);
};

const sendProdError = (err, res) => {
  if (!err.isOperational) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "Development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "Production") {
    let error = { ...err };
    if (error.code === 11000) err = handleDuplicateKeyError(error);

    if (err.name === "ValidationError") err = handleValidationError(error);
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError(error);
    if (err.name === "JsonWebTokenError") err = handleInvalidJWTError(error);

    sendProdError(err, res);
  }
};
