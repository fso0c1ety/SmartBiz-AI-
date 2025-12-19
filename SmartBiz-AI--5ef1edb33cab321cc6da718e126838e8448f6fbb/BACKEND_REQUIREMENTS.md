# Backend API Endpoints - SmartBiz AI Employees

## Required Backend Routes for Real AI Automation

### 1. Enhanced Agent Creation
**POST** `/api/agents/enhanced`

Create an AI agent with role-specific configuration (Marketing/Sales/Support/Content).

**Request Body:**
```json
{
  "type": "marketing" | "sales" | "support" | "content",
  "basicInfo": {
    "businessName": "string",
    "industry": "string",
    "description": "string (optional)",
    "targetAudience": "string (optional)",
    "brandTone": "string"
  },
  "config": {
    // Marketing Agent Config
    "socialAccounts": {
      "instagram": { "username": "string", "accessToken": "string", "autoPost": boolean },
      "tiktok": { "username": "string", "accessToken": "string", "autoPost": boolean },
      "twitter": { "username": "string", "accessToken": "string", "autoPost": boolean },
      "facebook": { "pageId": "string", "accessToken": "string", "autoPost": boolean },
      "linkedin": { "profileId": "string", "accessToken": "string", "autoPost": boolean }
    },
    "postingFrequency": "daily" | "twice-daily" | "weekly",
    
    // Sales Agent Config
    "targetMarket": "string",
    "productService": "string",
    "priceRange": "string",
    "idealCustomer": "string",
    "leadSources": ["string"],
    "emailTemplate": "string",
    
    // Support Agent Config
    "emailAccounts": {
      "gmail": { "email": "string", "appPassword": "string", "autoReply": boolean },
      "outlook": { "email": "string", "appPassword": "string", "autoReply": boolean }
    },
    "responseTime": "immediate" | "1hour" | "24hours",
    
    // Content Agent Config
    "contentTypes": ["string"],
    "writingStyle": "string",
    "seoKeywords": "string",
    "contentLength": "short" | "medium" | "long"
  }
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "string",
    "type": "string",
    "status": "active",
    "createdAt": "timestamp"
  }
}
```

---

### 2. Generate Content (DeepSeek API Integration)
**POST** `/api/agents/:agentId/generate`

Use DeepSeek API to generate content based on agent configuration.

**Request Body:**
```json
{
  "contentType": "post" | "email" | "article" | "ad",
  "prompt": "string (optional)",
  "keywords": ["string"]
}
```

**DeepSeek Integration:**
```javascript
const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
  model: 'deepseek-chat',
  messages: [
    {
      role: 'system',
      content: `You are a ${agent.type} AI assistant for ${agent.businessName}. 
                Writing style: ${agent.writingStyle}. 
                Target audience: ${agent.targetAudience}.`
    },
    {
      role: 'user',
      content: prompt || `Create a ${contentType} about ${keywords.join(', ')}`
    }
  ],
  temperature: 0.7
}, {
  headers: {
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
  }
});
```

**Response:**
```json
{
  "success": true,
  "content": {
    "id": "string",
    "text": "Generated content from DeepSeek",
    "type": "post",
    "status": "draft"
  }
}
```

---

### 3. Post to Social Media
**POST** `/api/agents/:agentId/post`

Publish content to social media platforms using their APIs.

**Request Body:**
```json
{
  "platform": "instagram" | "tiktok" | "twitter" | "facebook" | "linkedin",
  "content": "string",
  "media": ["url1", "url2"] // optional
}
```

**Platform Integrations:**
- **Instagram**: Use Instagram Graph API with access token
- **Twitter**: Use Twitter API v2 with OAuth 2.0
- **LinkedIn**: Use LinkedIn API with OAuth 2.0
- **TikTok**: Use TikTok for Business API
- **Facebook**: Use Facebook Graph API

**Response:**
```json
{
  "success": true,
  "postId": "platform_post_id",
  "url": "https://platform.com/post/id"
}
```

---

### 4. Send Email (Support AI)
**POST** `/api/agents/:agentId/email`

Send or auto-reply to emails via SMTP.

**Request Body:**
```json
{
  "to": "email@example.com",
  "subject": "string",
  "body": "string",
  "isAutoReply": boolean
}
```

**SMTP Integration (Nodemailer):**
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook'
  auth: {
    user: agent.emailAccounts.gmail.email,
    pass: agent.emailAccounts.gmail.appPassword
  }
});

await transporter.sendMail({
  from: agent.emailAccounts.gmail.email,
  to: recipientEmail,
  subject: subject,
  html: generatedEmailBody // Use DeepSeek to generate response
});
```

**Response:**
```json
{
  "success": true,
  "messageId": "smtp_message_id"
}
```

---

### 5. Find Leads (Sales AI)
**POST** `/api/agents/:agentId/leads`

Find and qualify leads using web scraping or third-party APIs.

**Request Body:**
```json
{
  "criteria": {
    "industry": "string",
    "location": "string",
    "companySize": "string",
    "budget": "string"
  },
  "limit": 10
}
```

**Implementation Options:**
1. Use LinkedIn Sales Navigator API
2. Use Apollo.io API
3. Use Hunter.io for email finding
4. Web scraping with Puppeteer/Cheerio

**Response:**
```json
{
  "success": true,
  "leads": [
    {
      "id": "string",
      "name": "Company Name",
      "industry": "SaaS",
      "location": "USA",
      "email": "contact@company.com",
      "score": 85 // qualification score
    }
  ]
}
```

---

### 6. Get Agent Activity
**GET** `/api/agents/:agentId/activity`

Get real-time activity and status of an agent.

**Response:**
```json
{
  "success": true,
  "activity": {
    "status": "active" | "idle",
    "currentTask": "Creating Instagram post",
    "progress": 0.75,
    "tasksCompleted": 24,
    "tasksToday": 32,
    "lastActive": "2025-12-11T10:30:00Z"
  }
}
```

---

### 7. Get Generated Content
**GET** `/api/content?agentId=xxx&type=post&limit=50`

Retrieve generated content history.

**Query Parameters:**
- `agentId`: Filter by agent (optional)
- `type`: Filter by content type (optional)
- `limit`: Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "contents": [
    {
      "id": "string",
      "agentId": "string",
      "agentName": "Marketing AI",
      "type": "post",
      "platform": "instagram",
      "content": "Generated post text",
      "media": ["url1"],
      "status": "published",
      "createdAt": "2025-12-11T10:00:00Z",
      "engagement": {
        "likes": 245,
        "comments": 18,
        "shares": 12
      }
    }
  ]
}
```

---

### 8. OAuth Endpoints
**POST** `/api/oauth/instagram`
**POST** `/api/oauth/twitter`
**POST** `/api/oauth/linkedin`
**POST** `/api/oauth/facebook`

Handle OAuth authentication for social media platforms.

**Request Body:**
```json
{
  "code": "authorization_code_from_oauth_flow"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "platform_access_token",
  "expiresIn": 3600,
  "refreshToken": "refresh_token"
}
```

---

## Environment Variables Needed

```env
# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key

# Social Media APIs
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Email (SMTP)
GMAIL_USER=your_gmail_account
GMAIL_APP_PASSWORD=your_gmail_app_password

# Lead Generation
APOLLO_API_KEY=your_apollo_api_key
HUNTER_API_KEY=your_hunter_api_key

# Database
MONGODB_URI=mongodb://localhost:27017/smartbiz
```

---

## Database Schema Changes

### Agent Schema (Add these fields)
```javascript
{
  type: { type: String, enum: ['marketing', 'sales', 'support', 'content'] },
  config: {
    // Marketing
    socialAccounts: {
      instagram: { username: String, accessToken: String, autoPost: Boolean },
      tiktok: { username: String, accessToken: String, autoPost: Boolean },
      twitter: { username: String, accessToken: String, autoPost: Boolean },
      facebook: { pageId: String, accessToken: String, autoPost: Boolean },
      linkedin: { profileId: String, accessToken: String, autoPost: Boolean }
    },
    postingFrequency: String,
    
    // Sales
    targetMarket: String,
    productService: String,
    idealCustomer: String,
    leadSources: [String],
    emailTemplate: String,
    
    // Support
    emailAccounts: {
      gmail: { email: String, appPassword: String, autoReply: Boolean },
      outlook: { email: String, appPassword: String, autoReply: Boolean }
    },
    responseTime: String,
    
    // Content
    contentTypes: [String],
    writingStyle: String,
    seoKeywords: String,
    contentLength: String
  },
  activity: {
    status: { type: String, enum: ['active', 'idle'] },
    currentTask: String,
    progress: Number,
    tasksCompleted: Number,
    lastActive: Date
  }
}
```

### Content Schema (New Collection)
```javascript
{
  agentId: { type: ObjectId, ref: 'Agent' },
  type: { type: String, enum: ['post', 'email', 'article', 'ad'] },
  platform: String,
  content: String,
  media: [String],
  status: { type: String, enum: ['draft', 'published', 'scheduled'] },
  engagement: {
    likes: Number,
    comments: Number,
    shares: Number
  },
  createdAt: Date,
  publishedAt: Date
}
```

---

## Priority Implementation Order

1. **POST /api/agents/enhanced** - Agent creation with configs ✅ CRITICAL
2. **POST /api/agents/:id/generate** - DeepSeek content generation ✅ CRITICAL
3. **GET /api/content** - Content history ✅ CRITICAL
4. **POST /api/agents/:id/post** - Social media posting 🔥 HIGH
5. **POST /api/agents/:id/email** - Email automation 🔥 HIGH
6. **POST /api/agents/:id/leads** - Lead generation 🔥 HIGH
7. **GET /api/agents/:id/activity** - Real-time status ⚡ MEDIUM
8. **POST /api/oauth/*** - OAuth flows ⚡ MEDIUM

---

## Next Steps

1. Install required packages:
   ```bash
   npm install axios nodemailer puppeteer cheerio
   ```

2. Set up DeepSeek API integration
3. Configure OAuth apps for social platforms
4. Set up SMTP for email automation
5. Implement background job processing (Bull/Redis) for scheduled posts
6. Add webhook handlers for engagement tracking
