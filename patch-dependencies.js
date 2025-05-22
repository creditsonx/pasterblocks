#!/usr/bin/env node

// Simple script to patch node_modules by creating shims for problematic dependencies
const fs = require('fs');
const path = require('path');

// Directories to check for Solana mobile imports
const modulesToPatch = [
  'node_modules/@solana/wallet-adapter-react/lib',
  'node_modules/@solana/wallet-adapter-wallets/lib',
  'node_modules/@solana/wallet-adapter-base/lib'
];

// Create empty shim files for problematic imports
function createShim(directory) {
  // Create directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Create shim file
  const shimContent = `
// This is an empty shim to avoid import errors
export default {};
export const transact = () => {};
export const createTransactionBroadcaster = () => ({});
export const createSignTransactionsBroadcaster = () => ({});
export const findTransactions = () => [];
export const MobileLedgerWalletAdapter = function() { return {}; };
`;

  // Create shim files
  const files = [
    '@solana-mobile/wallet-adapter-mobile.js',
    '@solana-mobile/mobile-wallet-adapter-protocol.js',
    '@solana-mobile/mobile-wallet-adapter-protocol-web3js.js'
  ];

  files.forEach(file => {
    const filePath = path.join(directory, file);
    fs.writeFileSync(filePath, shimContent);
    console.log(`Created shim: ${filePath}`);
  });
}

// Add import maps to redirected problematic imports
function createImportMap() {
  const importMapContent = {
    imports: {
      '@solana-mobile/wallet-adapter-mobile': './shims/empty-module.js',
      '@solana-mobile/mobile-wallet-adapter-protocol': './shims/empty-module.js',
      '@solana-mobile/mobile-wallet-adapter-protocol-web3js': './shims/empty-module.js'
    }
  };

  // Create directory if it doesn't exist
  const shimsDir = path.join(__dirname, 'src', 'shims');
  if (!fs.existsSync(shimsDir)) {
    fs.mkdirSync(shimsDir, { recursive: true });
  }

  // Create empty module
  const emptyModuleContent = 'export default {};\n';
  fs.writeFileSync(path.join(shimsDir, 'empty-module.js'), emptyModuleContent);
  console.log('Created empty module shim');

  // Create import map
  fs.writeFileSync(
    path.join(__dirname, 'import-map.json'),
    JSON.stringify(importMapContent, null, 2)
  );
  console.log('Created import map');
}

// Run the patching process
modulesToPatch.forEach(module => {
  try {
    createShim(module);
  } catch (error) {
    console.error(`Error patching ${module}:`, error);
  }
});

// Create import map
createImportMap();

console.log('Dependency patching complete!');
