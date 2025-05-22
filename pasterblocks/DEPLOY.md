# PasterBlocks: Solana Tetris Deployment Guide

This document outlines the steps needed to deploy the PasterBlocks Solana Tetris game with its leaderboard backend.

## Prerequisites

1. A Netlify account
2. A Neon PostgreSQL database (already set up)
3. (Optional) A Solana wallet for admin operations

## Setup Steps

### 1. Database Setup

The Neon PostgreSQL database has already been set up with the following details:

- **Project**: pasterblocks-leaderboard
- **Branch**: development
- **Connection String**: `postgresql://neondb_owner:npg_CGNXR5QBWJw8@ep-aged-water-a58jjqdl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 2. Environment Variables

Configure the following environment variables in your Netlify site settings:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgres://user:password@host/database` |
| `ADMIN_TOKEN` | Secret token for admin operations | `your-secure-random-token` |
| `NODE_ENV` | Environment name | `production` |

### 3. Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Configure the build settings:
   - Build command: `curl -fsSL https://bun.sh/install | bash && ~/.bun/bin/bun install && ~/.bun/bin/bun run build`
   - Publish directory: `dist`

### 4. Initialize the Database

After deployment, you need to initialize the database schema by making a POST request to the init-db function:

```bash
curl -X POST https://your-netlify-site.netlify.app/.netlify/functions/init-db \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json"
```

Replace `your-netlify-site.netlify.app` with your actual Netlify domain and `your-admin-token` with the token you set in the environment variables.

## Testing the Deployment

## Local Testing

Before deploying to Netlify, you can test the application locally:

1. Start the Netlify development server: `netlify dev`
2. Run the database connection test: `bun run test-db`
3. Initialize the database (if needed): `bun run init-db`
4. Open the application in your browser and test the functionality

## Production Testing

After deploying to Netlify:

1. Visit your Netlify site URL
2. Connect a Solana wallet
3. Play the Tetris game to generate a score
4. Check that the score appears in the leaderboard
5. Verify that the API endpoints are working by checking the Network tab in browser dev tools
6. Test the admin panel by clicking the "Admin Panel" button (requires admin token)

## Available API Endpoints

- `GET /api/leaderboard`: Get top scores
- `POST /api/scores`: Submit a new score
- `GET /api/players/:walletAddress/scores`: Get a player's scores
- `GET /api/players/:walletAddress/rank`: Get a player's rank
- `PUT /api/scores/:scoreId/claim`: Claim rewards

## Troubleshooting

If you encounter issues with the deployment:

1. Check Netlify function logs in the Netlify dashboard
2. Verify that environment variables are correctly set
3. Make sure your Neon database is running and accessible
4. Test API endpoints using curl or Postman

For database-specific issues, check the Neon dashboard for connection statistics and logs.
