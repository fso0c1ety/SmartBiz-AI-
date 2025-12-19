import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AgentService } from '../services/agent.service';

export class AgentController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await AgentService.createAgent({
        ...req.body,
        userId: req.userId!,
      });
      res.status(201).json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await AgentService.getAgentById(req.params.id, req.userId!);
      res.status(200).json(agent);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async getByBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agents = await AgentService.getAgentsByBusiness(
        req.params.businessId,
        req.userId!
      );
      res.status(200).json(agents);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AgentService.deleteAgent(req.params.id, req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateMemory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await AgentService.updateAgentMemory(
        req.params.id,
        req.userId!
      );
      res.status(200).json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createEnhanced(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await AgentService.createEnhancedAgent({
        ...req.body,
        userId: req.userId!,
      });
      res.status(201).json({ success: true, agent });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async generateContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const content = await AgentService.generateContent(
        req.params.id,
        req.body,
        req.userId!
      );
      res.status(200).json({ success: true, content });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async postToSocial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AgentService.postToSocialMedia(
        req.params.id,
        req.body,
        req.userId!
      );
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async sendEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AgentService.sendEmail(
        req.params.id,
        req.body,
        req.userId!
      );
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async findLeads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const leads = await AgentService.findLeads(
        req.params.id,
        req.body,
        req.userId!
      );
      res.status(200).json({ success: true, leads });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const activity = await AgentService.getAgentActivity(
        req.params.id,
        req.userId!
      );
      res.status(200).json({ success: true, activity });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
}
