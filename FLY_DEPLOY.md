# Fly.io Deployment

## Install Fly CLI
```powershell
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

## Deploy Commands
```bash
# Navigate to backend
cd backend

# Login
fly auth login

# Initialize app
fly launch --no-deploy

# Add PostgreSQL
fly postgres create

# Deploy
fly deploy
```

## Free Tier
- 3 shared-cpu VMs
- 3GB persistent volume storage
- 160GB outbound data transfer
