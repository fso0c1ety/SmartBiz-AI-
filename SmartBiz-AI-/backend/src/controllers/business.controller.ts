import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BusinessService } from '../services/business.service';

export class BusinessController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const business = await BusinessService.createBusiness({
        userId: req.userId!,
        ...req.body,
      });
      res.status(201).json(business);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businesses = await BusinessService.getAllBusinesses(req.userId!);
      res.status(200).json(businesses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const business = await BusinessService.getBusinessById(
        req.params.id,
        req.userId!
      );
      res.status(200).json(business);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const business = await BusinessService.updateBusiness(
        req.params.id,
        req.userId!,
        req.body
      );
      res.status(200).json(business);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await BusinessService.deleteBusiness(
        req.params.id,
        req.userId!
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
