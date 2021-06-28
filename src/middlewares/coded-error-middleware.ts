import { NextFunction, Request, Response } from 'express';
import CodedError from '../exceptions/coded-error';

export const codedErrorMiddleware = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof CodedError) {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    return response.status(status).json({
      status,
      message,
    });
  }
  return response.status(500).json({
    status: 500,
    message: error.message,
  });
};

export default codedErrorMiddleware;
