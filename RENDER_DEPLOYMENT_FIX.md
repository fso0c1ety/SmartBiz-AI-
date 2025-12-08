# Render Deployment Fix

## Issue
Render build command failed: `bash: line 1: cd: backend: No such file or directory`

## Solution

In your Render Dashboard for "smartbiz-ai-backend":

### 1. Go to "Settings" tab

### 2. Update Build & Deploy Settings:

**Root Directory**
- Leave EMPTY (or delete if you set it to "backend")

**Build Command**
```
npm install && npm run build
```

**Start Command**
```
npm start
```

### 3. In the same section, scroll to "Environment Variables"

Make sure these are set:
```
NODE_ENV=production
PORT=5001
DEEPSEEK_API_KEY=sk-5a98cdbd57ad43f38a2c705f29e39051
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 4. Add Secret File

Scroll down to "Secret Files" section:
- Click **"Add Secret File"**
- **Filename**: `.env`
- **Contents**: Paste your entire `.env` file content
- Click **Add**

### 5. Pre-Deploy Command

Set to:
```
npm run prisma:push
```

### 6. Click "Save" and then "Redeploy"

---

## Why This Works

- **Root Directory Empty**: Render will use the repo root, so `npm install` runs in the root
- **But we need backend code**: Create a `package.json` script in the root that builds backend
- **Secret File**: Keeps your `.env` secure without committing to git

---

## Alternative: Update Root package.json

If above doesn't work, add these scripts to root `package.json`:

```json
"scripts": {
  "build": "cd backend && npm install && npm run build",
  "start": "cd backend && npm start"
}
```

Then in Render:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
