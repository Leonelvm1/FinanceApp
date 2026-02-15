#!/bin/bash
# Build script for Render
set -e

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "Running migrations..."
alembic upgrade head

echo "Backend ready for deployment"
