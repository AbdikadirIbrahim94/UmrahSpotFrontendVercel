#!/usr/bin/env bash
set -e

BACKEND_DIR="/var/www/app/backend"
ECOSYSTEM_FILE="$BACKEND_DIR/ecosystem.config.js"
PM2_APP_NAME="umrahspot-backend"

echo "[Deploy] Starting backend deployment..."
cd "$BACKEND_DIR"

echo "[Deploy] Installing dependencies..."
npm install

echo "[Deploy] Building backend..."
npm run build

echo "[Deploy] Reloading PM2..."
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    pm2 reload "$PM2_APP_NAME"
else
    pm2 start "$ECOSYSTEM_FILE" --only "$PM2_APP_NAME"
fi

pm2 save

echo "[Deploy] Listing PM2 processes..."
pm2 status

echo "[Deploy] Backend deployment completed."
