import { Router } from 'express';
import { body } from 'express-validator';
import { BusinessController } from '../controllers/business.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create business validation
const createValidation = [
  body('name').trim().notEmpty().withMessage('Business name is required'),
  body('industry').optional().trim(),
  body('description').optional().trim(),
  body('targetAudience').optional().trim(),
  body('brandTone').optional().trim(),
  body('socialLinks').optional().isObject(),
  body('logoUrl').optional().isURL(),
  body('brandColors').optional().isObject(),
  body('goals').optional().isArray(),
];

// Update validation
const updateValidation = [
  body('name').optional().trim().notEmpty(),
  body('industry').optional().trim(),
  body('description').optional().trim(),
  body('targetAudience').optional().trim(),
  body('brandTone').optional().trim(),
  body('socialLinks').optional().isObject(),
  body('logoUrl').optional().isURL(),
  body('brandColors').optional().isObject(),
  body('goals').optional().isArray(),
];

// Routes
router.post('/create', validate(createValidation), BusinessController.create);
router.get('/all', BusinessController.getAll);
router.get('/:id', BusinessController.getById);
router.put('/:id/edit', validate(updateValidation), BusinessController.update);
router.delete('/:id', BusinessController.delete);

export default router;
