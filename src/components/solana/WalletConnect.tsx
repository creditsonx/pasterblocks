import { type FC, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Removed mobile detection override that modifies userAgent to prevent issues with missing @solana-mobile package

export const WalletConnectButton: FC = () => {
  const { publicKey } = useWallet();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <WalletMultiButton className="relative bg-gray-900 text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200 hover:bg-gray-800 group-hover:scale-[1.01]" />
      </div>

      {publicKey && (
        <div className="text-sm text-purple-300 font-medium bg-gray-900 px-3 py-1 rounded-full border border-violet-500">
          <span className="text-gray-400 mr-1">Connected:</span>
          {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
        </div>
      )}
    </div>
  );
};

export const WalletConnectionProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  // Set up the network to devnet
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Only use web wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};