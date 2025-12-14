# Deployment Guide

This guide covers deploying the Video Transcript Platform to production.

## Architecture Overview

- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Node.js + Express + Python (requires separate hosting)

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub/GitLab/Bitbucket account (optional, for Git-based deployment)
- Vercel account (free tier available)

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from project root**
   ```bash
   cd /path/to/video-transcript-platform
   vercel
   ```

3. **Follow the prompts**
   - Login to Vercel
   - Set up project name
   - Accept default settings (vercel.json will be used)

4. **Set environment variable**
   After deployment, set the backend URL:
   ```bash
   vercel env add VITE_API_URL
   ```
   Enter your backend URL (e.g., `https://your-backend.railway.app`)

5. **Redeploy with environment variable**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: Your backend URL
6. Click "Deploy"

## Backend Deployment

The backend requires Python dependencies and cannot run on Vercel. Choose one of these platforms:

### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select the `backend` directory
4. Railway will auto-detect Node.js
5. Add build command: `npm install`
6. Add start command: `npm start`
7. Install system dependencies in railway.toml:
   ```toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "npm start"
   
   [nixpacks]
   packages = ["python3", "ffmpeg", "yt-dlp"]
   ```
8. Copy the deployed URL and use it as `VITE_API_URL` in Vercel

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && pip install faster-whisper yt-dlp`
   - Start Command: `npm start`
5. Add environment variables if needed
6. Deploy and copy the URL

### Option 3: Fly.io

1. Install Fly CLI: `brew install flyctl`
2. Login: `fly auth login`
3. Create app: `fly launch` (in backend directory)
4. Deploy: `fly deploy`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
PORT=3001
NODE_ENV=production
```

## CORS Configuration

Ensure your backend allows requests from your Vercel frontend URL. Update `backend/server.js`:

```javascript
app.use(cors({
    origin: ['http://localhost:5173', 'https://your-frontend.vercel.app'],
    credentials: true
}))
```

## Testing Deployment

1. Visit your Vercel URL
2. Paste a video URL
3. Click "Generate Transcript"
4. Verify the transcription works end-to-end

## Troubleshooting

### CORS Errors
- Add your Vercel URL to backend CORS configuration
- Ensure backend URL in `VITE_API_URL` is correct

### API Not Found
- Verify `VITE_API_URL` environment variable is set in Vercel
- Check backend is running and accessible
- Verify backend URL includes protocol (https://)

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## Cost Estimate

- **Vercel**: Free tier (100GB bandwidth, unlimited requests)
- **Railway**: Free tier ($5 credit/month, ~500 hours)
- **Render**: Free tier (750 hours/month)
- **Backend costs**: Minimal on free tiers for moderate usage

## Updating Deployment

### Frontend
```bash
git push  # If using Git integration
# or
vercel --prod  # If using CLI
```

### Backend
- Railway/Render: Auto-deploys on git push
- Manual: Redeploy from dashboard

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render/Fly.io
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] End-to-end testing completed
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
