#!/bin/bash
# Деплой на GitHub Pages: собирает dist и публикует в ветку gh-pages.
# При переходе на собственный домен: DEPLOY_BASE=/ ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"
npm run build
cd dist
touch .nojekyll
git init -q -b gh-pages
git add -A
git commit -q -m "deploy $(date +%Y-%m-%d_%H:%M)"
git push -qf https://github.com/avedaler/daler-os.git gh-pages
rm -rf .git
echo "✓ https://avedaler.github.io/daler-os/"
