import React from 'react';
import { Wallet, Loader } from 'lucide-react';

const WalletConnect = ({ onConnect, loading }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Wallet className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your MetaMask wallet to start using TokenSwapSafe
          </p>
        </div>
        
        <button
          onClick={onConnect}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </div>
          ) : (
            'Connect MetaMask'
          )}
        </button>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Make sure you have MetaMask installed in your browser</p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect; 