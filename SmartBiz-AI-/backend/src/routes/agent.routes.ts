import { Router } from 'express';
import { body } from 'express-validator';
import { AgentController } from '../controllers/agent.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create agent validation
const createValidation = [
  body('agentName').trim().notEmpty().withMessage('Agent name is required'),
];

// Routes
router.post('/create', validate(createValidation), AgentController.create);
router.post('/enhanced', AgentController.createEnhanced);
router.get('/:id', AgentController.getById);
router.get('/by-business/:businessId', AgentController.getByBusiness);
router.delete('/:id', AgentController.delete);
router.post('/:id/update-memory', AgentController.updateMemory);
router.post('/:id/generate', AgentController.generateContent);
router.post('/:id/post', AgentController.postToSocial);
router.post('/:id/email', AgentController.sendEmail);
router.post('/:id/leads', AgentController.findLeads);
router.get('/:id/activity', AgentController.getActivity);

export default router;
