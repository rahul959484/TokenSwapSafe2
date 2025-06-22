import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowRight, Plus, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import CreateSwap from './CreateSwap';
import ExecuteSwap from './ExecuteSwap';

const TokenSwapEscrow = ({ contract, account, provider }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [userSwaps, setUserSwaps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      loadUserSwaps();
    }
  }, [contract, account]);

  const loadUserSwaps = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // This would need to be implemented based on your contract events
      // For now, we'll use a placeholder
      setUserSwaps([]);
    } catch (error) {
      console.error('Error loading swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCreated = () => {
    loadUserSwaps();
  };

  const handleSwapExecuted = () => {
    loadUserSwaps();
  };

  const handleSwapCancelled = () => {
    loadUserSwaps();
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Swap
          </button>
          <button
            onClick={() => setActiveTab('execute')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'execute'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Execute Swap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'create' ? (
          <CreateSwap
            contract={contract}
            account={account}
            provider={provider}
            onSwapCreated={handleSwapCreated}
          />
        ) : (
          <ExecuteSwap
            contract={contract}
            account={account}
            provider={provider}
            onSwapExecuted={handleSwapExecuted}
            onSwapCancelled={handleSwapCancelled}
          />
        )}
      </div>

      {/* User's Active Swaps */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Active Swaps</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading swaps...</p>
          </div>
        ) : userSwaps.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active swaps found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userSwaps.map((swap, index) => (
              <SwapCard
                key={index}
                swap={swap}
                account={account}
                contract={contract}
                onAction={loadUserSwaps}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SwapCard = ({ swap, account, contract, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.cancelSwap(swap.id);
      await tx.wait();
      onAction();
    } catch (error) {
      console.error('Error cancelling swap:', error);
      alert('Failed to cancel swap');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (swap.isCompleted) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (swap.isCancelled) return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusText = () => {
    if (swap.isCompleted) return 'Completed';
    if (swap.isCancelled) return 'Cancelled';
    return 'Active';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium">{getStatusText()}</span>
        </div>
        <span className="text-sm text-gray-500">
          ID: {swap.id?.slice(0, 8)}...
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">You're giving:</h4>
          <div className="space-y-1">
            {swap.inputTokens?.map((token, index) => (
              <div key={index} className="text-sm text-gray-600">
                {swap.inputAmounts?.[index]} {token}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">You're receiving:</h4>
          <div className="space-y-1">
            {swap.outputTokens?.map((token, index) => (
              <div key={index} className="text-sm text-gray-600">
                {swap.outputAmounts?.[index]} {token}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Deadline: {new Date(swap.deadline * 1000).toLocaleString()}</span>
        {swap.isActive && swap.initiator === account && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenSwapEscrow; 