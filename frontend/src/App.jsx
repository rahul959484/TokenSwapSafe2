import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Shield, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import TokenSwapEscrow from './components/TokenSwapEscrow';
import WalletConnect from './components/WalletConnect';
import SwapHistory from './components/SwapHistory';
import contractABI from './contracts/TokenSwapEscrow.json';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Initialize contract with deployed address
        const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Deployed contract address
        
        if (contractAddress && contractAddress !== "0x...") {
          const contractInstance = new ethers.Contract(contractAddress, contractABI.abi, signer);
          setContract(contractInstance);
        }
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setIsConnected(false);
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">TokenSwapSafe</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure escrow smart contract for safely transacting multiple tokens between parties
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          {!isConnected ? (
            <WalletConnect onConnect={connectWallet} loading={loading} />
          ) : (
            <div className="space-y-8">
              {/* Wallet Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-gray-700">Connected:</span>
                    <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Main Swap Interface */}
              <TokenSwapEscrow 
                contract={contract} 
                account={account} 
                provider={provider} 
              />

              {/* Swap History */}
              <SwapHistory 
                contract={contract} 
                account={account} 
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>TokenSwapSafe - Secure Token Escrow Platform</p>
        </footer>
      </div>
    </div>
  );
}

export default App; 