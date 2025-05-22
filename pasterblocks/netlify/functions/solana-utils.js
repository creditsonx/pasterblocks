import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

/**
 * Verify a signature from a Solana wallet
 * @param {string} walletAddress - Solana wallet address
 * @param {Object} data - Data that was signed
 * @param {string} signature - Base58 encoded signature
 * @returns {boolean} Whether the signature is valid
 */
async function verifySignature(walletAddress, data, signature) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const signatureBytes = bs58.decode(signature);
    const message = new TextEncoder().encode(JSON.stringify(data));

    return nacl.sign.detached.verify(
      message,
      signatureBytes,
      publicKey.toBytes()
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Check if a score is potentially fraudulent
 * @param {Object} gameData - Game data to analyze
 * @returns {Object} Analysis result
 */
function analyzeGameData(gameData) {
  const { score, level, lines, gameTime } = gameData;

  // Detect unusual scoring patterns
  const averageScorePerLine = score / (lines || 1);
  const averageScorePerSecond = score / (gameTime || 1);
  const averageLinesPerLevel = lines / (level || 1);

  const suspiciousFlags = [];

  // Check for unrealistic scoring rate
  if (averageScorePerSecond > 100) {
    suspiciousFlags.push('Unusually high scoring rate');
  }

  // Check for unrealistic lines per level
  if (averageLinesPerLevel > 15) {
    suspiciousFlags.push('Unrealistic lines per level');
  }

  // Check for unrealistic score per line
  if (averageScorePerLine > 1000) {
    suspiciousFlags.push('Unrealistic score per line');
  }

  // Check for impossible game time
  if (gameTime < 10 && score > 1000) {
    suspiciousFlags.push('Impossibly short game time for score');
  }

  return {
    isSuspicious: suspiciousFlags.length > 0,
    suspiciousFlags,
    scoreMetrics: {
      averageScorePerLine,
      averageScorePerSecond,
      averageLinesPerLevel
    }
  };
}

export {
  verifySignature,
  analyzeGameData
};
