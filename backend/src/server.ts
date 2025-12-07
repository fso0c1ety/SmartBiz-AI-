import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import agentRoutes from './routes/agent.routes';
import chatRoutes from './routes/chat.routes';
import contentRoutes from './routes/content.routes';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables from backend/.env explicitly
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('🤖 AI provider: DeepSeek only');

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/agent', chatRoutes);
app.use('/api/agent', contentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
