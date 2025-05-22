import { useState } from 'react';
import { Game } from './components/game/Game';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WalletConnectionProvider, WalletConnectButton } from './components/solana/WalletConnect';
import UPDATED_PROFILE_IMAGE_PATH from './utils/profileImagePath';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <WalletConnectionProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            {/* Clickable logo section */}
            <a
              href="https://x.com/pasterblocks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-90 transition"
            >
              <div className="mr-3">
                <img
                  src={UPDATED_PROFILE_IMAGE_PATH}
                  alt="@pasterblocks"
                  className="w-10 h-10 rounded-full border-2 border-violet-500"
                />
              </div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                $PASTERBLOCKS
              </h2>
            </a>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="text-xs text-gray-300 hover:text-white px-3 py-1 rounded-full border border-gray-600 hover:border-violet-500 transition-colors"
              >
                {showAdmin ? 'Show Game' : 'Admin Panel'}
              </button>
              <WalletConnectButton />
            </div>
          </div>

          <div className="flex flex-col items-center">
            {showAdmin ? <AdminDashboard /> : <Game />}
          </div>
        </div>

        <footer className="mt-12 pb-6 text-center">
          <div className="text-sm text-gray-400">
            Powered by
            <a
              href="https://x.com/pasterblocks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 font-medium hover:text-blue-300 transition-colors ml-1"
            >
              @pasterblocks
            </a>
            <div className="mt-1">
              Deployed on
              <a
                href="https://www.x.com/BelieveApp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 font-medium hover:text-purple-300 transition-colors ml-1"
              >
                @BelieveApp
              </a>
            </div>
          </div>
        </footer>
      </div>
    </WalletConnectionProvider>
  );
}

export default App;
