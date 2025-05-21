#!/bin/bash
# Deployment script for PasterBlocks

echo "Installing dependencies..."
bun install

echo "Building project..."
bun run build:prod

echo "Build complete! Files are in the dist directory."
echo "Ready for deployment to Netlify."
