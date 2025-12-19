# SmartBiz AI Employees - Backend

Complete backend system for SmartBiz AI Employees with AI memory integration, vector embeddings, and intelligent agent management.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/           # Database & JWT configuration
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic & AI services
│   ├── middleware/       # Auth, validation, error handling
│   ├── routes/           # API route definitions
│   └── server.ts         # Express server setup
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── package.json
├── tsconfig.json
└── .env
```

## 🚀 Features

- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Business Management**: Create and manage multiple businesses per user
- **AI Agents**: Create specialized AI agents for each business
- **Memory System**: Vector embeddings for intelligent context retrieval
- **Chat Interface**: Conversational AI with memory continuity
- **Content Generation**: AI-powered content creation (posts, captions, ads, blogs, emails)
- **PostgreSQL + pgvector**: Vector similarity search for relevant memory retrieval

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+ with pgvector extension
- OpenAI API key

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartbiz_ai?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="sk-your-openai-api-key-here"
PORT=5000
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:19006"
```

### Step 3: Set Up PostgreSQL with pgvector

#### Option A: Using PostgreSQL Locally

1. Install PostgreSQL 14+
2. Install pgvector extension:

```bash
# On Ubuntu/Debian
sudo apt-get install postgresql-14-pgvector

# On macOS (with Homebrew)
brew install pgvector
```

3. Create database:

```sql
CREATE DATABASE smartbiz_ai;
\c smartbiz_ai
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Option B: Using Supabase (Recommended for Production)

1. Create a Supabase project at https://supabase.com
2. pgvector is already installed
3. Copy your database URL to `.env`

### Step 4: Run Prisma Migrations

```bash
npx prisma generate
npx prisma db push
```

### Step 5: Start the Server

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

**Example: Register**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

Response:
{
  "user": { "id": "...", "name": "John Doe", "email": "..." },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Businesses

```
POST   /api/business/create
GET    /api/business/all
GET    /api/business/:id
PUT    /api/business/:id/edit
DELETE /api/business/:id
```

**Example: Create Business**
```json
POST /api/business/create
Headers: { "Authorization": "Bearer <token>" }
{
  "name": "TechStart Inc",
  "industry": "Technology",
  "description": "AI-powered software solutions",
  "targetAudience": "Tech-savvy entrepreneurs and startups",
  "brandTone": "innovative and approachable",
  "brandColors": {
    "primary": "#6366F1",
    "secondary": "#8B5CF6"
  },
  "goals": ["Increase brand awareness", "Generate leads", "Build community"]
}
```

### Agents

```
POST   /api/agent/create
GET    /api/agent/:id
GET    /api/agent/by-business/:businessId
DELETE /api/agent/:id
POST   /api/agent/:id/update-memory
```

**Example: Create Agent**
```json
POST /api/agent/create
Headers: { "Authorization": "Bearer <token>" }
{
  "businessId": "uuid-of-business",
  "agentName": "Marketing Manager"
}

Response:
{
  "id": "...",
  "businessId": "...",
  "agentName": "Marketing Manager",
  "memory": "BUSINESS IDENTITY:\n- Name: TechStart Inc\n...",
  "createdAt": "..."
}
```

### Chat

```
POST /api/agent/:id/chat
GET  /api/agent/:id/messages
```

**Example: Chat with Agent**
```json
POST /api/agent/:agentId/chat
Headers: { "Authorization": "Bearer <token>" }
{
  "message": "Create a social media strategy for our product launch"
}

Response:
{
  "message": "Based on TechStart Inc's innovative and approachable brand tone, here's a comprehensive social media strategy...",
  "usage": { "prompt_tokens": 450, "completion_tokens": 320 }
}
```

### Content Generation

```
POST /api/agent/:id/content/create
GET  /api/agent/:id/content/all
```

**Example: Generate Content**
```json
POST /api/agent/:agentId/content/create
Headers: { "Authorization": "Bearer <token>" }
{
  "type": "post",
  "prompt": "Announce our new AI feature"
}

Response:
{
  "content": {
    "id": "...",
    "type": "post",
    "data": {
      "prompt": "Announce our new AI feature",
      "content": "🚀 Exciting news! TechStart Inc just launched...",
      "businessName": "TechStart Inc",
      "brandTone": "innovative and approachable"
    }
  },
  "usage": { ... }
}
```

## 🧠 AI Memory System

### How It Works

1. **Memory Profile Generation**: When an agent is created, business data is converted into a structured memory profile
2. **Vector Embeddings**: The memory is converted to embeddings using OpenAI's `text-embedding-3-small` model
3. **Vector Storage**: Embeddings are stored in PostgreSQL with pgvector
4. **Similarity Search**: When a user sends a message, relevant memories are retrieved using cosine similarity
5. **Context Injection**: Retrieved memories + conversation history are injected into the AI prompt

### Memory Types

- **Business Profile**: Core business identity, tone, goals
- **Conversation History**: Last 10 messages for continuity
- **Relevant Context**: Top 3 most relevant memories based on user query

### Automatic Updates

When business data is edited, agent memory is automatically updated:

```json
POST /api/agent/:agentId/update-memory
```

This regenerates embeddings to keep the AI in sync with current business information.

## 🗄️ Database Schema

```prisma
User (id, name, email, passwordHash)
  └── Business (id, userId, name, industry, description, ...)
      └── Agent (id, businessId, agentName, memory)
          ├── AgentMemory (id, agentId, content, embedding, metadata)
          ├── Message (id, agentId, role, message)
          └── Content (id, agentId, type, data)
```

## 🚢 Deployment

### Option 1: Vercel + Supabase (Recommended)

1. **Deploy Database**:
   - Create Supabase project
   - Copy DATABASE_URL
   - Run migrations: `npx prisma db push`

2. **Deploy Backend**:
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy

### Option 2: Railway

1. Create Railway project
2. Add PostgreSQL service
3. Add environment variables
4. Connect GitHub repo
5. Deploy automatically

### Option 3: DigitalOcean App Platform

1. Create new app
2. Add PostgreSQL database
3. Configure environment variables
4. Deploy from GitHub

### Option 4: AWS (EC2 + RDS)

1. **RDS Setup**:
   - Create PostgreSQL 14+ instance
   - Enable pgvector extension
   - Note connection string

2. **EC2 Setup**:
   ```bash
   # SSH into EC2
   git clone <your-repo>
   cd backend
   npm install
   npm run build
   
   # Use PM2 for process management
   npm install -g pm2
   pm2 start dist/server.js --name smartbiz-api
   pm2 startup
   pm2 save
   ```

3. **Environment Variables**:
   - Create `.env` on EC2
   - Add all required variables

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` to Git
2. **JWT Secret**: Use a strong, randomly generated secret (32+ characters)
3. **CORS**: Restrict `ALLOWED_ORIGINS` to your frontend domain
4. **Rate Limiting**: Add rate limiting middleware (e.g., express-rate-limit)
5. **Input Validation**: All inputs are validated using express-validator
6. **SQL Injection**: Protected by Prisma's parameterized queries
7. **Password Hashing**: Bcrypt with salt rounds = 10

## 🧪 Testing

```bash
# Add tests (optional)
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

## 📊 Monitoring

Recommended tools:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Performance monitoring
- **Prisma Studio**: Database GUI (`npx prisma studio`)

## 🔧 Troubleshooting

### pgvector not found

```bash
# Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### Prisma migration issues

```bash
# Reset database (development only)
npx prisma migrate reset

# Or push schema directly
npx prisma db push
```

### OpenAI rate limits

Implement retry logic or upgrade API tier.

### Memory/Performance

- Add Redis for caching
- Implement connection pooling
- Use database indexes (already configured)

## 📈 Scaling Considerations

1. **Database Connection Pooling**: Configure Prisma connection limits
2. **Redis Caching**: Cache frequently accessed business/agent data
3. **Queue System**: Use Bull/BullMQ for async content generation
4. **Load Balancing**: Use multiple server instances behind load balancer
5. **CDN**: Serve static assets via CDN
6. **Database Replicas**: Read replicas for heavy read workloads

## 🤝 Contributing

This is a production-ready backend. Customize as needed for your specific requirements.

## 📄 License

MIT License

---

**Built with**: Node.js, Express, TypeScript, Prisma, PostgreSQL, OpenAI, pgvector
