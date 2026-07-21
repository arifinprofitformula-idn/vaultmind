#!/bin/bash
# Auto-commit & push script for VaultMind live server
# Run from cron every 5 minutes

cd /opt/vaultmind || exit 0

# Only push if there are changes
if [ -z "$(git status --porcelain)" ]; then
    exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Changes detected, pushing..."

git add -A
git commit -m "auto: sync live changes from VPS — $(date '+%Y-%m-%d %H:%M')"
git push origin main 2>&1

echo "✅ Pushed"
