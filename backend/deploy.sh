#!/bin/bash
set -e

# SAM Build and Deploy Script
# Reads GEMINI_API_KEY from env.local.json and generates env.json for SAM

echo "====================================="
echo "SAM Build and Deploy"
echo "====================================="

# Check if env.local.json exists
if [ ! -f "env.local.json" ]; then
    echo "Error: env.local.json not found!"
    echo "Please create env.local.json with your GEMINI_API_KEY"
    echo "See env.example.json for reference"
    exit 1
fi

# Load API key from env.local.json using node
API_KEY=$(node -p "require('./env.local.json').GEMINI_API_KEY")

if [ -z "$API_KEY" ] || [ "$API_KEY" = "undefined" ]; then
    echo "Error: GEMINI_API_KEY not found in env.local.json"
    exit 1
fi

# Generate env.json for SAM Local from env.local.json
echo "Generating env.json for SAM Local..."
node -e "
const envLocal = require('./env.local.json');
const envJson = {
  AnalyzeFunction: envLocal
};
require('fs').writeFileSync('env.json', JSON.stringify(envJson, null, 2));
"

echo "✓ API Key loaded from env.local.json"
echo "✓ env.json generated for SAM Local"
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
