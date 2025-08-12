# 🚀 Vercel Deployment Guide

## Quick Deploy Steps

### 1. Automatic Deployment (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "Import Project"
4. Select `Kakrote/udyam-registration-app` repository
5. Vercel will auto-detect Next.js and deploy!

### 2. Manual Deployment (Optional)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy "~/project-1"? [Y/n] y
# ? Which scope do you want to deploy to? Your Name
# ? Link to existing project? [y/N] n
# ? What's your project's name? udyam-registration-app
# ? In which directory is your code located? ./
```

## 🌐 Your Live URLs
After deployment, your app will be available at:
- **Frontend**: `https://udyam-registration-app-kakrote.vercel.app`
- **API Health**: `https://udyam-registration-app-kakrote.vercel.app/api/health`
- **Form Submit**: `https://udyam-registration-app-kakrote.vercel.app/api/submit`
- **Form Schema**: `https://udyam-registration-app-kakrote.vercel.app/api/form-schema`

## ✅ What's Included
- ✅ Full-stack Next.js app
- ✅ API routes for backend functionality
- ✅ Form validation with Zod
- ✅ Responsive UI with TailwindCSS
- ✅ Web scraping integration
- ✅ Health check endpoint

## 🔧 Environment Variables
Vercel will automatically set:
- `NEXT_PUBLIC_API_URL=/api`
- `NODE_ENV=production`

## 📱 Features Available
- **Step-by-step form** with validation
- **Mobile-responsive design**
- **Real-time form validation**
- **Progress tracking**
- **API endpoints ready**

## 🆓 Cost
**Completely FREE** on Vercel's hobby plan!
