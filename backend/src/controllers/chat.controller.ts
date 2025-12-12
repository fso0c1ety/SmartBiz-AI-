import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';

export class ChatController {
  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AIService.chat({
        agentId: req.params.id,
        message: req.body.message,
        userId: req.userId!,
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const messages = await AIService.getMessages(req.params.id, req.userId!);
      res.status(200).json(messages);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateMessageMedia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { messageId } = req.params as any;
      const { media } = req.body as any;
      const result = await AIService.updateMessageMedia({ messageId, media, userId: req.userId! });
      res.status(200).json({ success: true, content: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
