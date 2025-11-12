#!/bin/bash

# Build and deploy Lambda function

echo "Building Lambda function..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Installing production dependencies..."
cd dist
npm install --production --prefix . @google/generative-ai

echo "Creating deployment package..."
zip -r ../lambda.zip . -x "*.map"

cd ..
echo "Deployment package created: lambda.zip"
echo "Size: $(du -h lambda.zip | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Upload lambda.zip to AWS Lambda"
echo "2. Set GEMINI_API_KEY environment variable"
echo "3. Configure API Gateway"
