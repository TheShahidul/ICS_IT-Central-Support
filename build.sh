#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================="
echo "  ICS - IT Central Support: Build Script"
echo "=========================================="

echo ">>> 1. Installing Frontend Dependencies and Building Static Assets..."
npm --prefix frontend install
npm --prefix frontend run build

echo ">>> 2. Installing Backend Python Dependencies..."
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

echo ">>> 3. Verifying Production Build..."
if [ -f "frontend/dist/index.html" ]; then
    echo "✓ Frontend bundle verified in frontend/dist/"
else
    echo "✗ Error: frontend/dist/index.html not found!"
    exit 1
fi

echo "=========================================="
echo "  Build Completed Successfully!"
echo "=========================================="
