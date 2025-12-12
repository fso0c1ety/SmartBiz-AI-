import { Router } from 'express';
import { body } from 'express-validator';
import { ContentController } from '../controllers/content.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Content generation validation
const generateValidation = [
  body('type')
    .isIn(['post', 'caption', 'ad', 'blog', 'email', 'image'])
    .withMessage('Valid content type is required'),
  body('prompt').trim().notEmpty().withMessage('Prompt is required'),
];

// Image generation validation
const imageValidation = [
  body('prompt').trim().notEmpty().withMessage('Prompt is required'),
  body('size').optional().isIn(['1024x1024', '512x512', '256x256']).withMessage('Invalid size'),
];

// Routes
router.post('/:id/content/create', validate(generateValidation), ContentController.generate);
router.post('/:id/image/generate', validate(imageValidation), ContentController.generateImage);
router.get('/:id/content/all', ContentController.getAll);
router.get('/', ContentController.getAllContent); // Get all content with filters
// Persist media for a specific content item
// When mounted at /api/content -> final path: /api/content/:contentId/media
// When mounted at /api/agent    -> final path: /api/agent/:contentId/media (not used by frontend)
router.put('/:contentId/media', ContentController.updateContentMedia);

export default router;
