# SmartBiz AI - Deployment Checklist

## Pre-Deployment Setup

### Backend Configuration
- [ ] Ensure `backend/package.json` has correct scripts:
  - `build`: Compiles TypeScript
  - `start`: Runs production server
  - `dev`: Runs development server

- [ ] Backend listens on `process.env.PORT` (not hardcoded)
  - Check `backend/src/server.ts`

- [ ] `.env` file NOT committed to git
  - Check `backend/.gitignore`

### Frontend Configuration  
- [ ] `src/config/api.config.ts` created ✓
- [ ] `src/services/api.service.ts` updated to use new config ✓
- [ ] All environment variables in `.env` (not .env.example)

### Environment Variables Required

**Backend (.env)**
```
NODE_ENV=production
PORT=5001
DATABASE_URL=your_database_url
DEEPSEEK_API_KEY=your_deepseek_key
JWT_SECRET=random_string_12345
JWT_EXPIRY=7d
```

---

## Deployment Steps

### Option A: Render (Free Tier - Recommended)

#### 1. Prepare Repository
```powershell
cd c:\Users\Valon\Desktop\SmartBiz-AI-Employees
git add .
git commit -m "Add deployment configuration and API config"
git push origin main
```

#### 2. Deploy on Render
1. Visit https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Select `fso0c1ety/SmartBiz-AI-` repository
5. Fill in:
   - **Name**: `smartbiz-ai-backend`
   - **Runtime**: Node
   - **Root Directory**: `backend` (if prompted)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

#### 3. Add Environment Variables in Render
In the "Environment" section, add:
```
NODE_ENV=production
PORT=5001
DATABASE_URL=[your-database-url]
DEEPSEEK_API_KEY=[your-api-key]
JWT_SECRET=[random-secret]
JWT_EXPIRY=7d
```

#### 4. Deploy & Get URL
- Click "Create Web Service"
- Wait for deployment to complete
- Your URL will be: `https://smartbiz-ai-backend.onrender.com`

---

### Option B: Railway (Paid - $5/month)

#### 1. Deploy
1. Visit https://railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

#### 2. Get URL
Your URL will be: `https://smartbiz-ai-[random].up.railway.app`

---

## Update APK for Production

### Step 1: Update API URL
Edit `src/config/api.config.ts`:

Change this line (around line 24):
```typescript
// PRODUCTION URL
return 'https://smartbiz-ai-backend.onrender.com/api';
```

### Step 2: Build APK
```powershell
cd c:\Users\Valon\Desktop\SmartBiz-AI-Employees

# Build APK
eas build --platform android

# Or build locally
npx expo build:android
```

### Step 3: Install on Device
```powershell
# Download APK from build output
# Transfer to phone via USB/email
# Install APK on Android device
```

---

## Testing Deployment

### 1. Test Backend Health
```powershell
# Replace URL with your deployed backend
curl https://smartbiz-ai-backend.onrender.com/api/health
# Should return 200 OK
```

### 2. Test from Expo (Dev)
```powershell
# Update api.config.ts to point to production URL
# Run: npx expo start
# Test login, create business, chat
```

### 3. Test from APK (Prod)
- Install APK on physical device
- Test all features:
  - [ ] Login
  - [ ] Create business
  - [ ] Select AI employee
  - [ ] Send chat message
  - [ ] Verify response from AI

---

## After Deployment

### Monitor Backend
- Check Render/Railway dashboard for errors
- Monitor logs for API issues
- Watch for 502/503 errors

### Update Frequently
```powershell
# Make changes locally
git add .
git commit -m "Update feature X"
git push origin main

# Render auto-deploys on push
# Wait 2-3 minutes for deployment
```

### Domain Setup (Optional)
```
1. Buy domain (GoDaddy, Namecheap)
2. Add CNAME: api → smartbiz-ai-backend.onrender.com
3. Update api.config.ts to use domain
4. Rebuild APK
```

---

## Troubleshooting

### 502 Bad Gateway Error
- Check backend logs in Render/Railway
- Verify DATABASE_URL is correct
- Ensure all env vars are set

### Connection Refused
- Backend not running - check status in dashboard
- Wrong URL in api.config.ts
- Firewall/CORS blocking request

### APK Won't Connect
- Verify APK is using correct production URL
- Check internet connection on phone
- Verify backend is running

### Database Issues
- Test connection string locally
- Ensure database is accessible from cloud
- Check PostgreSQL connection limits

---

## Demo Checklist

Before showing to partners:
- [ ] APK installed on phone
- [ ] Backend deployed and running
- [ ] All features tested
- [ ] Offline features cached (if applicable)
- [ ] Error handling tested
- [ ] Performance acceptable (sub-2s responses)

---

## Quick Reference

| Component | Development | Production |
|-----------|------------|-----------|
| Backend | `http://192.168.0.27:5001` | `https://smartbiz-ai-backend.onrender.com` |
| Frontend | Expo dev | APK build |
| Database | Local SQLite | Cloud PostgreSQL |
| Updates | Instant reload | Rebuild & reinstall |
