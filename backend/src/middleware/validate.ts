import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      const message = error.errors ? error.errors[0].message : error.message;
      res.status(400).json({ success: false, error: message });
    }
  };
