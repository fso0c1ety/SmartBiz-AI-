# Deployment Guide for SmartBiz AI

## Option 1: Render (Free Tier - Recommended)

### Step 1: Push to GitHub
```powershell
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo: `fso0c1ety/SmartBiz-AI-`
5. Configure:
   - **Name**: `smartbiz-ai-backend`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add:
- `NODE_ENV`: `production`
- `PORT`: `5001`
- `DATABASE_URL`: Your database URL
- `DEEPSEEK_API_KEY`: Your API key
- `JWT_SECRET`: Random secret string

### Step 4: Get Your URL
Once deployed, you'll get a URL like: `https://smartbiz-ai-backend.onrender.com`

---

## Option 2: Railway (Paid - $5/month minimum)

1. Go to https://railway.app
2. Connect GitHub repo
3. Add environment variables
4. Deploy automatically

---

## Option 3: Custom Domain

To use a domain like `api.smartbiz.com`:

1. **Buy domain** (GoDaddy, Namecheap) - ~$10/year
2. **Deploy backend** to Render/Railway
3. **Update DNS** in domain registrar:
   - Add CNAME: `api` → `smartbiz-ai-backend.onrender.com`
4. **Update APK** to use `https://api.smartbiz.com`

---

## Update APK for New Backend URL

### Option A: Environment Variable (Recommended)

Create `backend.config.ts`:
```typescript
const API_URL = __DEV__ ? 'http://localhost:5001' : 'https://smartbiz-ai-backend.onrender.com';
export default API_URL;
```

Update `useApi.ts`:
```typescript
import API_URL from '../config/backend.config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});
```

### Option B: Build-time Configuration

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://smartbiz-ai-backend.onrender.com"
    }
  }
}
```

---

## Build APK for Demo

```powershell
# Build APK
eas build --platform android --auto-submit

# Or for local build
npx expo build:android

# Download APK to phone/test device
```

---

## Monitoring & Logs

### Render
- Dashboard shows logs automatically
- Monitor performance in real-time

### Email Setup
- Configure email for alerts

---

## Common Issues

### Port Issues
- Render uses PORT 5001 automatically
- Make sure server listens on `process.env.PORT`

### Database Connection
- Use full connection string with `?schema=public`
- Test connection before deploying

### CORS
- Update CORS settings in backend for production domain
- Add `https://smartbiz-ai-backend.onrender.com`

---

## Costs Summary

| Option | Cost | Setup Time |
|--------|------|-----------|
| Render Free | $0/month | 5 min |
| Railway | $5+/month | 5 min |
| Custom Domain | $10/year | 30 min |
| Heroku | $7+/month | 5 min |

**Recommendation**: Start with Render Free, upgrade to Railway for reliability.
