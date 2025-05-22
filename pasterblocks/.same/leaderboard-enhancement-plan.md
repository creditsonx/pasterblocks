# PasterBlocks Leaderboard Enhancement Plan

## Current Limitations

The current leaderboard system has several limitations:

1. **Local Storage Only**: Scores are only stored in the browser's localStorage, meaning they're not shared across players
2. **No Verification**: There's no verification that scores are legitimate
3. **No Persistence**: Scores are lost if a user clears their browser data
4. **Potential for Manipulation**: Advanced users could modify localStorage data to create fake high scores

## Enhancement Goals

We'll implement a comprehensive solution with:

1. **Server-Side Storage**: Centralized database for all player scores
2. **Blockchain Verification**: Use Solana to verify score authenticity
3. **Anti-Cheat Measures**: Implement mechanisms to detect and prevent cheating

## Implementation Plan

### Phase 1: Server-Side API and Database

1. **Set Up Backend Services**:
   - Create a Node.js/Express API
   - Set up a PostgreSQL database using Neon
   - Deploy API to a serverless platform (e.g., Vercel, Netlify Functions)

2. **Database Schema**:
   ```sql
   CREATE TABLE players (
     wallet_address VARCHAR(44) PRIMARY KEY,
     display_name VARCHAR(100),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE scores (
     id SERIAL PRIMARY KEY,
     wallet_address VARCHAR(44) REFERENCES players(wallet_address),
     score INTEGER NOT NULL,
     level INTEGER NOT NULL,
     lines INTEGER NOT NULL,
     game_time INTEGER NOT NULL, -- total game time in seconds
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     verified BOOLEAN DEFAULT FALSE,
     verification_signature TEXT, -- signature from wallet
     verification_data TEXT, -- game data used for verification
     client_info JSON, -- info about client for anti-cheat
     rewards_claimed BOOLEAN DEFAULT FALSE,
     rewards_amount BIGINT
   );

   CREATE INDEX scores_wallet_idx ON scores(wallet_address);
   CREATE INDEX scores_score_idx ON scores(score DESC);
   ```

3. **API Endpoints**:
   - `POST /api/scores`: Submit a new score
   - `GET /api/leaderboard`: Get top 50 scores
   - `GET /api/players/:walletAddress/scores`: Get a player's scores
   - `GET /api/players/:walletAddress/rank`: Get a player's rank
   - `POST /api/rewards/claim`: Claim rewards for a verified score

### Phase 2: Solana Blockchain Integration

1. **Score Verification Process**:
   - When a game ends, create a verification payload with:
     - Player's wallet address
     - Final score, level, and lines
     - Game duration
     - Game seed (random value generated at start)
     - Key game events (timestamps of line clears, level ups)

   - Have player sign this payload with their Solana wallet
   - Submit both the payload and signature to the server
   - Server verifies the signature matches the connected wallet

2. **Rewards System**:
   - Create a Solana program for distributing $PASTERBLOCKS tokens
   - Players with verified scores can claim tokens based on their ranking
   - Use blockchain to record all reward distributions

3. **Signature Verification Code**:
   ```javascript
   // Server-side verification
   async function verifyScoreSignature(walletAddress, scoreData, signatureBase64) {
     try {
       const publicKey = new PublicKey(walletAddress);
       const signature = bs58.decode(signatureBase64);
       const message = new TextEncoder().encode(JSON.stringify(scoreData));

       return nacl.sign.detached.verify(message, signature, publicKey.toBytes());
     } catch (error) {
       console.error('Verification error:', error);
       return false;
     }
   }
   ```

### Phase 3: Anti-Cheat Measures

1. **Client-Side Monitoring**:
   - Track gameplay metrics (timing between moves, input patterns)
   - Generate a "gameplay fingerprint" to detect bot-like behavior
   - Implement rate limiting for game actions

2. **Server-Side Validation**:
   - Validate that game events make logical sense
     - Line clear rates should follow reasonable patterns
     - Game duration should match reported score
     - Level progression should follow expected patterns
   - Flag suspicious scores for manual review

3. **Anomaly Detection**:
   - Implement statistical analysis on server to detect outliers
   - Apply machine learning techniques to identify unusual gameplay patterns
   - Create a scoring reputation system for players

4. **Secure Communication**:
   - Encrypt game state data sent to the server
   - Implement replay protection to prevent replay attacks
   - Add server-side timestamps to all communications

### Phase 4: UI and User Experience

1. **Enhanced Leaderboard UI**:
   - Add filtering options (all-time, weekly, daily)
   - Show verification status with visual indicators
   - Display player statistics and history

2. **Rewards Dashboard**:
   - Show available and claimed rewards
   - Display reward distribution schedule
   - Integrate with Solana wallet for claiming

3. **Admin Panel**:
   - Create moderation tools for suspicious scores
   - Implement analytics dashboard for game statistics
   - Add ability to manage reward distribution

## Technical Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  PasterBlocks   │       │   API Server    │       │     Solana      │
│  Game Client    │ ───── │  (Node.js &     │ ───── │    Blockchain   │
│                 │       │   PostgreSQL)   │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │                         │                         │
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  User Wallet    │       │   Anti-Cheat    │       │ $PASTERBLOCKS   │
│  (Verification) │       │     System      │       │  Token Program  │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

## Implementation Timeline

1. **Week 1**: Server-side API and database setup
2. **Week 2**: Client integration with server API
3. **Week 3**: Blockchain verification implementation
4. **Week 4**: Anti-cheat measures and testing
5. **Week 5**: UI enhancements and final testing

## Required Technologies

1. **Backend**:
   - Node.js & Express
   - PostgreSQL (Neon)
   - Serverless functions (Netlify or Vercel)

2. **Blockchain**:
   - Solana Web3.js
   - Anchor framework for Solana programs
   - SPL Token for $PASTERBLOCKS

3. **Security**:
   - TweetNaCl.js for cryptographic operations
   - JSON Web Tokens (JWT) for API authentication
   - Rate limiting middleware

## Conclusion

This enhancement will transform the PasterBlocks leaderboard from a local, client-side feature to a robust, secure, and verified global system. By leveraging Solana for verification and implementing comprehensive anti-cheat measures, we can ensure fair competition and build trust in the reward distribution system.
