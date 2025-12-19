import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';

export class ChatController {
  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    console.log('[ChatController] sendMessage called:', {
      agentId: req.params.id,
      message: req.body.message,
      userId: req.userId!,
      file: req.file ? req.file.originalname : undefined,
    });
    try {
      // If an image is uploaded, store it in Media and pass to AIService
      let uploadedMediaId: string | undefined;
      let imageBase64: string | undefined;
      if (req.file) {
        // Convert buffer to base64 data URI
        const mimeType = req.file.mimetype;
        imageBase64 = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;
      }

      let message = req.body.message;
      // If image is present and no message, set default prompt for description
      if (imageBase64 && (!message || !message.trim())) {
        message = 'Describe this image.';
      }
      const result = await AIService.chat({
        agentId: req.params.id,
        message,
        userId: req.userId!,
        image: imageBase64,
      });
      console.log('[ChatController] AIService.chat result:', result);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('[ChatController] Error:', error);
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
