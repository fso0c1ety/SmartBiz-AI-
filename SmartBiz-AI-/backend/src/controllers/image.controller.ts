import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

// POST /api/image/analyze
export async function analyzeImage(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    // Save file info to Media table
    const imageUrl = `/uploads/${file.filename}`;
    const media = await req.app.get('prisma').media.create({
      data: {
        url: imageUrl,
        mimeType: file.mimetype,
        // Optionally associate with agent/message/content if available
      },
    });
    // type: 'caption' | 'email' | 'code' | 'image' | etc.
    // prompt: optional user prompt/context
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(file.path);
    const result = await AIService.analyzeImage({
      imageBuffer,
      prompt,
    });
    res.json({ success: true, result, media });
  } catch (error) {
    let message = 'Image analysis failed';
    if (error && typeof error === 'object' && 'message' in error) {
      message = (error as any).message || message;
    } else if (typeof error === 'string') {
      message = error;
    }
    res.status(500).json({ error: message });
  }
}
