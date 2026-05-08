import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  let error = { ...err };
  error.message = err.message;

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'Field';
    error.message = `${field} already exists`;
    return res.status(400).json({ success: false, error: error.message });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    error.message = 'Resource not found';
    return res.status(404).json({ success: false, error: error.message });
  }

  // Zod validation error (if using custom middleware to catch zod errors)
  if (err.name === 'ZodError') {
    const message = err.errors.map((e: any) => e.message).join(', ');
    return res.status(400).json({ success: false, error: message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
