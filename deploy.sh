#!/bin/bash
# ============================================
# Deploy Script - Run on VPS
# Usage: bash deploy.sh
# ============================================

set -e

APP_DIR="/var/www/mitid"
APP_NAME="mitid"

echo ""
echo "=========================================="
echo "  Deploying MitID Clone"
echo "=========================================="

# 1. Go to app directory
echo ""
echo "[1/7] Navigating to $APP_DIR..."
cd $APP_DIR

# 2. Pull latest code
echo ""
echo "[2/7] Pulling latest code..."
git pull origin main

# 3. Install dependencies
echo ""
echo "[3/7] Installing dependencies..."
npm install --production=false

# 4. Build frontend
echo ""
echo "[4/7] Building frontend..."
npm run build

# 5. Restart server
echo ""
echo "[5/7] Restarting server..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start server/index.js --name $APP_NAME

# 6. Save PM2 process list
echo ""
echo "[6/7] Saving PM2 process list..."
pm2 save

# 7. Verify
echo ""
echo "[7/7] Verifying deployment..."
sleep 2
HEALTH=$(curl -s http://localhost:3001/api/health)
if [ "$HEALTH" = '{"ok":true}' ]; then
  echo ""
  echo "=========================================="
  echo "  DEPLOY SUCCESSFUL"
  echo "=========================================="
  echo ""
  echo "  Server: http://$(curl -s ifconfig.me)"
  echo "  Health: $HEALTH"
  echo ""
else
  echo ""
  echo "=========================================="
  echo "  DEPLOY FAILED - Server not responding"
  echo "=========================================="
  echo ""
  echo "  Check logs: pm2 logs $APP_NAME --lines 20"
  echo ""
  pm2 logs $APP_NAME --lines 10 --nostream
fi
