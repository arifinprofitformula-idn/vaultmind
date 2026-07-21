#!/bin/bash
# Auto-pull & rebuild script for VaultMind
# Checks if GitHub has new commits, pulls and rebuilds if so

set -e

REPO="/opt/vaultmind"
LOG_TAG="[vaultmind-sync]"

cd "$REPO" || exit 1

# Fetch latest from GitHub
git fetch origin main 2>&1

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    exit 0
fi

echo "$LOG_TAG New commits detected: $LOCAL → $REMOTE"

# Pull changes
git pull origin main 2>&1

echo "$LOG_TAG Building..."
npm run build 2>&1

echo "$LOG_TAG Restarting service..."
sudo systemctl restart vaultmind

sleep 3
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/)
echo "$LOG_TAG Deploy complete — HTTP $STATUS"
