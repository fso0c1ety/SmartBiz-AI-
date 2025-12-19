import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await AuthService.getUserById(req.userId!);
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
