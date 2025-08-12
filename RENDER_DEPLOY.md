# Render Deployment Guide

## Free Tier Limits
- 750 hours/month (about 31 days)
- Sleeps after 15 minutes of inactivity
- Free PostgreSQL for 90 days

## Setup Instructions
1. Go to render.com and sign up
2. Connect GitHub repository
3. Create new Web Service
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Environment: Node.js

## Environment Variables to Add
```
NODE_ENV=production
DATABASE_URL=your-postgres-url
JWT_SECRET=your-secret-key
```
