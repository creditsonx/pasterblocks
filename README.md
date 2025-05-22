# PasterBlocks: Solana Tetris

A Tetris game with Solana wallet integration and PasterBlocks token rewards. Play the game, earn tokens, and climb the leaderboard!

![PasterBlocks Logo](/public/assets/images/pasternak-logo.png)

## Features

- **Tetris Gameplay**: Classic Tetris mechanics with modern visuals
- **Solana Integration**: Connect your Solana wallet to play and earn
- **Leaderboard System**: Compete for the top spot on the global leaderboard
- **PasterBlocks Rewards**: Earn $PASTERBLOCKS tokens for good performance
- **Admin Dashboard**: Monitor player scores and suspicious activity

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Netlify Serverless Functions
- **Database**: Neon PostgreSQL
- **Blockchain**: Solana Web3.js

## Development

To start developing:

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Test database connection
bun run test-db

# Initialize database (with Netlify dev running)
bun run init-db
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## Project Structure

- `/src`: Frontend React application
  - `/components`: UI components
  - `/hooks`: React hooks for game logic
  - `/utils`: Utility functions
  - `/types`: TypeScript type definitions
- `/netlify/functions`: Serverless API functions
  - `leaderboard.js`: Main API endpoints
  - `admin-stats.js`: Admin dashboard API
  - `init-db.js`: Database initialization
- `/public`: Static assets

## License

Copyright (c) @pasterblocks & @BelieveApp. All rights reserved.

## Deployment Info

Last deployed: May 21, 2025

## Deployment Info

Last deployed: May 21, 2025