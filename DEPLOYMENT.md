# Deploying to Netlify

This guide will help you deploy the DPA Financial Portal to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. Your backend API URL
3. Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Push to Git Repository

Make sure your code is pushed to a Git repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider and select your repository
4. Netlify will auto-detect the build settings from `netlify.toml`

### 3. Configure Environment Variables

In Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add the following variables:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://api.yourdomain.com/api/v1`)

### 4. Deploy

Click "Deploy site" - Netlify will:
- Install dependencies (`npm install`)
- Build your project (`npm run build`)
- Deploy the `dist` folder

## Build Configuration

The `netlify.toml` file contains:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Redirects**: SPA routing support (all routes redirect to `index.html`)
- **Node version**: 18

## Environment Variables

Create a `.env` file locally (already in `.gitignore`):

```env
VITE_API_BASE_URL=https://your-backend-api.com/api/v1
```

> **Note**: Never commit `.env` files. Use Netlify's environment variables dashboard for production.

## Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

## Continuous Deployment

Once connected, Netlify automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push
```

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure environment variables are set correctly

### 404 Errors on Refresh
- The `netlify.toml` redirects should handle this
- Verify the `[[redirects]]` section exists in `netlify.toml`

### API Connection Issues
- Verify `VITE_API_BASE_URL` is set correctly in Netlify
- Check CORS settings on your backend
- Ensure your backend API is accessible from the internet

## Local Testing

Test the production build locally:

```bash
npm run build
npm run preview
```

This will serve the built files from the `dist` folder.
