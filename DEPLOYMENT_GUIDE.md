# AnswerDoctor - Deployment Guide

## Vercel Deployment (Frontend)

### Step 1: Prepare Your Repository
```bash
# Make sure everything is committed
cd answerdoctor
git add -A
git commit -m "Deploy frontend to Vercel"
git push origin main
```

### Step 2: Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `sohum123451/answerdoctor`
4. Select "answerdoctor" as the root directory (or configure to use `frontend` folder)

### Step 3: Configure Build Settings
In Vercel dashboard:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Environment Variables
Add in Vercel Project Settings → Environment Variables:

```
VITE_API_URL = https://your-backend-api.com/api
```

Replace with your actual backend URL:
- Local: `http://127.0.0.1:8000/api`
- Production: Your deployed backend URL (Render, Railway, AWS, etc.)

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete (usually 2-5 minutes)
3. Get your live URL: `https://your-project.vercel.app`

### Step 6: Test
- Visit your Vercel URL
- Go through the flow:
  1. Role selection (Teacher/Student)
  2. Auth type (Sign In/Sign Up)
  3. Email/Google login
  4. Dashboard

## Backend Deployment (Optional - Render.com)

### Step 1: Create Render Account
Go to [render.com](https://render.com) and sign up

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select `answerdoctor` repository

### Step 3: Configure
- **Runtime**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000`

### Step 4: Environment Variables
Add in Render settings:
```
DATABASE_URL=sqlite:///./test.db
```

### Step 5: Deploy
- Click "Deploy"
- Copy your backend URL: `https://your-backend.onrender.com`

### Step 6: Update Frontend
In Vercel settings, update:
```
VITE_API_URL = https://your-backend.onrender.com/api
```

## Quick Deployment Checklist

- [ ] Code committed and pushed to GitHub
- [ ] No `.env` files with secrets in git
- [ ] `vercel.json` configured correctly
- [ ] Environment variables set in Vercel
- [ ] Backend API URL configured
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Local testing complete
- [ ] Vercel project created and connected
- [ ] Deployment successful
- [ ] Live URL tested

## Testing After Deployment

### Test Flows
1. **Teacher Flow**:
   - Email: prof.sharma@vit.ac.in
   - Role: Teacher
   - Auth: Sign In
   - ✓ See classrooms and analytics

2. **Student Flow**:
   - Email: sohum@vit.ac.in
   - Role: Student
   - Auth: Sign In
   - ✓ See submissions and feedback

## Troubleshooting

### Build fails on Vercel
```
Error: Cannot find module 'vite'
→ Run: npm install
→ Check package.json has all dependencies
```

### CORS errors
```
Error: Access to XMLHttpRequest blocked by CORS policy
→ Backend needs CORS enabled (already configured in FastAPI)
→ Check VITE_API_URL is correct
```

### Blank page after deploy
```
→ Check browser console for errors
→ Verify VITE_API_URL environment variable
→ Check backend is accessible from frontend
```

### Auth not working
```
→ Verify backend API is running
→ Check network tab in browser DevTools
→ Ensure VITE_API_URL is correct format
```

## Production URLs

**Frontend**: https://answerdoctor.vercel.app (example)
**Backend**: https://answerdoctor-backend.onrender.com (example)

## Next Steps

- Set up GitHub Actions for automated testing
- Add SSL certificate (Vercel handles this)
- Configure custom domain
- Set up monitoring and logging
- Add CI/CD pipeline

---

**Deployment Status**: Ready for production ✅
**Live Demo**: Check your Vercel URL
**Support**: Check error logs in Vercel dashboard
