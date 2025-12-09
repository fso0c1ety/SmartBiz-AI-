import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';

export class ContentController {
  static async generate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AIService.generateContent({
        agentId: req.params.id,
        type: req.body.type,
        prompt: req.body.prompt,
        userId: req.userId!,
      });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async generateImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AIService.generateImage({
        agentId: req.params.id,
        prompt: req.body.prompt,
        userId: req.userId!,
        size: req.body.size || '1024x1024',
      });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const contents = await AIService.getAllContent(req.params.id, req.userId!);
      res.status(200).json(contents);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
