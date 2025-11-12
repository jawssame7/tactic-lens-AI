#!/bin/bash
set -e

# SAM Build and Deploy Script
# Reads GEMINI_API_KEY from env.json

echo "====================================="
echo "SAM Build and Deploy"
echo "====================================="

# Check if env.json exists
if [ ! -f "env.json" ]; then
    echo "Error: env.json not found!"
    echo "Please create env.json with your GEMINI_API_KEY"
    exit 1
fi

# Load API key from env.json using node
API_KEY=$(node -p "require('./env.json').AnalyzeFunction.GEMINI_API_KEY")

if [ -z "$API_KEY" ] || [ "$API_KEY" = "undefined" ]; then
    echo "Error: GEMINI_API_KEY not found in env.json"
    exit 1
fi

echo "✓ API Key loaded from env.json"
echo ""

echo "Building TypeScript code..."
npm run build

if [ $? -ne 0 ]; then
    echo "✗ TypeScript build failed!"
    exit 1
fi

echo "✓ TypeScript build completed"
echo ""

echo "Building SAM application..."
sam build

if [ $? -ne 0 ]; then
    echo "✗ Build failed!"
    exit 1
fi

echo "✓ Build completed"
echo ""

echo "Deploying to AWS..."
sam deploy --parameter-overrides "GeminiApiKey=${API_KEY}"

if [ $? -ne 0 ]; then
    echo "✗ Deploy failed!"
    exit 1
fi

echo ""
echo "====================================="
echo "✓ Deployment completed successfully!"
echo "====================================="
