import { Router } from 'express';
import { body } from 'express-validator';
import { ChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Chat validation
const chatValidation = [
  body('message').trim().notEmpty().withMessage('Message is required'),
];

// Routes
router.post('/:id/chat', validate(chatValidation), ChatController.sendMessage);
router.get('/:id/messages', ChatController.getMessages);
// Persist media for a specific chat message
router.put('/messages/:messageId/media', ChatController.updateMessageMedia);

export default router;
