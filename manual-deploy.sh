#!/bin/bash

# This script performs a manual deployment to Netlify

echo "Building the project..."
bun run build

echo "Creating deployment package..."
cd dist
zip -r ../manual-deploy.zip .
cd ..

echo "Manual deployment package created: manual-deploy.zip"
echo ""
echo "To deploy manually to Netlify:"
echo "1. Go to https://app.netlify.com/projects/resonant-salamander-261e98/overview"
echo "2. Click on the 'Deploys' tab"
echo "3. Click the 'Deploy manually' button"
echo "4. Upload the manual-deploy.zip file"
echo ""
echo "Alternatively, you can try restarting the build on Netlify:"
echo "1. Go to https://app.netlify.com/projects/resonant-salamander-261e98/overview"
echo "2. Click on the 'Deploys' tab"
echo "3. Click on the '...' menu next to the latest deploy"
echo "4. Select 'Retry build with cache'"
echo ""
echo "If issues persist, you may need to check Netlify's GitHub integration settings."
