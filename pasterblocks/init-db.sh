#!/bin/bash

# Initialize the database for PasterBlocks Netlify deployment

# Check if URL parameter is provided
if [ -z "$1" ]; then
  echo "Please provide your Netlify site URL as a parameter."
  echo "Usage: ./init-db.sh https://your-netlify-site.netlify.app"
  exit 1
fi

NETLIFY_URL=$1
ADMIN_TOKEN="pasterblocks_admin_token_2025"

echo "Initializing PasterBlocks database at $NETLIFY_URL..."
echo "Using admin token: $ADMIN_TOKEN"

# Initialize the database
curl -X POST "$NETLIFY_URL/.netlify/functions/init-db" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo "Database initialization request complete!"
echo "If you see a success message above, your database has been initialized."
echo "You can now visit $NETLIFY_URL to play PasterBlocks!"
echo ""
echo "To test the admin dashboard:"
echo "1. Visit $NETLIFY_URL"
echo "2. Click on 'Admin Panel'"
echo "3. Enter the admin token: $ADMIN_TOKEN"
