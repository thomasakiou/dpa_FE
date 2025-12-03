# Quick Setup Guide

## Create Local Environment File

Run this command to create your `.env` file:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

The `.env` file is already configured with your production backend URL:
```
VITE_API_URL=https://vmi2848672.contaboserver.net/dpa
```

## Restart Development Server

After creating the `.env` file, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## For Netlify Deployment

Add this environment variable in Netlify Dashboard:
- **Key**: `VITE_API_URL`
- **Value**: `https://vmi2848672.contaboserver.net/dpa`

See `DEPLOYMENT.md` for full deployment instructions.
