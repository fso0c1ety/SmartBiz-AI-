import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';

export class ContentController {
  static async generate(req: AuthRequest, res: Response): Promise<void> {
    const allowedTypes = ['email', 'post', 'caption', 'code'];
    const { type } = req.body;
    console.log('[ContentController] generate called:', {
      agentId: req.params.id,
      type,
      prompt: req.body.prompt,
      userId: req.userId!,
    });
    if (!allowedTypes.includes(type)) {
      res.status(400).json({ error: `Invalid content type. Must be one of: ${allowedTypes.join(', ')}` });
      return;
    }
    try {
      const result = await AIService.generateContent({
        agentId: req.params.id,
        type,
        prompt: req.body.prompt,
        userId: req.userId!,
      });
      console.log('[ContentController] AIService.generateContent result:', result);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('[ContentController] Error:', error);
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

  static async getAllContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { agentId, type, limit } = req.query;
      const contents = await AIService.getFilteredContent({
        agentId: agentId as string,
        type: type as string,
        limit: limit ? parseInt(limit as string) : 50,
        userId: req.userId!,
      });
      res.status(200).json({ success: true, contents });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateContentMedia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { contentId } = req.params as any;
      const { media } = req.body as any;
      const result = await AIService.updateContentMedia({ contentId, media, userId: req.userId! });
      res.status(200).json({ success: true, content: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
