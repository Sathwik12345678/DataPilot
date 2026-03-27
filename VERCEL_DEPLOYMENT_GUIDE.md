# 🚀 Vercel Deployment Guide for DataPilot Frontend

## Quick Fix for Login/Signup Issues

The main issue is that the **frontend doesn't know where your backend is**. Follow these steps:

### Step 1: Set Environment Variables in Vercel

1. Go to your **Vercel Project Dashboard**
2. Navigate to **Settings → Environment Variables**
3. Add a new environment variable:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://datapilot-backend.onrender.com` (or your actual backend URL)
   - **Environments:** Select "Production" (and Preview/Development if needed)

4. Click **Save** and **redeploy** your project

### Step 2: Verify Your Backend URL

Before setting the environment variable, make sure your backend is actually deployed:

- Check if your backend is running: `https://datapilot-backend.onrender.com/health`
- If it returns `{"status": "OK", "version": "1.2.0"}`, your backend is working
- If not, deploy the backend first using the `render.yaml` file

### Step 3: Redeploy Frontend on Vercel

After setting environment variables:

```bash
# Option 1: Trigger redeploy from Vercel dashboard
# Go to Vercel → Project → Deployments → Redeploy

# Option 2: Push changes to trigger auto-deploy
git push origin main
```

### Step 4: Test Login/Signup

1. Visit your Vercel frontend URL
2. Try to login or signup
3. Check browser DevTools → Network tab to see if requests are going to the correct backend URL

## Environment Variable Reference

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_BASE_URL` | Your backend API URL | `https://datapilot-backend.onrender.com` |

## Troubleshooting

### Issue: Still getting "Login failed" error

**Check 1: Verify backend URL**
```bash
curl https://datapilot-backend.onrender.com/health
```
Should return: `{"status": "OK"}`

**Check 2: Open DevTools → Network tab**
- Look for `/login` request
- Check the URL in "Request URL" - should be your backend URL
- Check status code - should be 200 (or 401 if credentials wrong)

**Check 3: Check CORS errors**
- If you see CORS errors in Console, the backend CORS isn't allowing your frontend domain
- Backend needs to include your Vercel domain in `allow_origins`

### Issue: Environment variable not working

1. Confirm you saved the variable in Vercel
2. Check that variable is assigned to "Production" environment
3. Trigger a **redeploy** (not just a rebuild)
4. Wait 2-3 minutes for changes to propagate

## Backend Deployment (Render)

Your backend should be deployed on Render using `render.yaml`:

```bash
# Render reads render.yaml automatically
# Make sure your render.yaml is in the root directory
```

Key configuration in `render.yaml`:
- **Service Name:** `datapilot-backend`
- **Runtime:** `python3`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment:** Set `MONGO_URL` in Render dashboard

## Complete Setup Checklist

- [ ] Backend deployed to Render
- [ ] Backend URL accessible (`/health` endpoint works)
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] Frontend redeployed on Vercel
- [ ] Tested login/signup on deployed site
- [ ] Checked Network tab in DevTools
- [ ] No CORS errors in Console

## Notes

- **Development:** Uses `http://localhost:8000` by default
- **Production:** Uses `VITE_API_BASE_URL` environment variable
- **CORS:** Backend allows both Vercel (*.vercel.app) and Render domains
