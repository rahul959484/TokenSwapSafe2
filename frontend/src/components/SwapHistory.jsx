import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';

const SwapHistory = ({ contract, account }) => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  useEffect(() => {
    if (contract && account) {
      loadSwapHistory();
    }
  }, [contract, account]);

  const loadSwapHistory = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // This would need to be implemented based on your contract events
      // For now, we'll use a placeholder
      setSwaps([]);
    } catch (error) {
      console.error('Error loading swap history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSwaps = () => {
    if (filter === 'all') return swaps;
    return swaps.filter(swap => {
      if (filter === 'active') return swap.isActive && !swap.isCompleted && !swap.isCancelled;
      if (filter === 'completed') return swap.isCompleted;
      if (filter === 'cancelled') return swap.isCancelled;
      return true;
    });
  };

  const getStatusIcon = (swap) => {
    if (swap.isCompleted) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (swap.isCancelled) return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusText = (swap) => {
    if (swap.isCompleted) return 'Completed';
    if (swap.isCancelled) return 'Cancelled';
    if (swap.deadline < Math.floor(Date.now() / 1000)) return 'Expired';
    return 'Active';
  };

  const getRole = (swap) => {
    if (swap.initiator === account) return 'Initiator';
    if (swap.counterparty === account) return 'Counterparty';
    return 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Swap History</h3>
        <button
          onClick={loadSwapHistory}
          disabled={loading}
          className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Swap List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading swap history...</p>
        </div>
      ) : getFilteredSwaps().length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No swaps found in your history' 
              : `No ${filter} swaps found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {getFilteredSwaps().map((swap, index) => (
            <SwapHistoryCard
              key={index}
              swap={swap}
              account={account}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              getRole={getRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SwapHistoryCard = ({ swap, account, getStatusIcon, getStatusText, getRole }) => {
  const [expanded, setExpanded] = useState(false);

  const formatAmount = (amount) => {
    try {
      return ethers.formatEther(amount);
    } catch {
      return amount.toString();
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(swap)}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{getStatusText(swap)}</span>
                <span className="text-sm text-gray-500">({getRole(swap)})</span>
              </div>
              <div className="text-sm text-gray-500">
                ID: {swap.id?.slice(0, 8)}... | {new Date(swap.deadline * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {swap.inputTokens?.length || 0} → {swap.outputTokens?.length || 0} tokens
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Tokens */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Input Tokens</h4>
              <div className="space-y-2">
                {swap.inputTokens?.map((token, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatAddress(token)}:
                    </span>
                    <span className="font-mono">
                      {formatAmount(swap.inputAmounts[index])}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Tokens */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Output Tokens</h4>
              <div className="space-y-2">
                {swap.outputTokens?.map((token, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatAddress(token)}:
                    </span>
                    <span className="font-mono">
                      {formatAmount(swap.outputAmounts[index])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Initiator:</span>
                <span className="ml-2 font-mono">
                  {swap.initiator === account ? 'You' : formatAddress(swap.initiator)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Counterparty:</span>
                <span className="ml-2 font-mono">
                  {swap.counterparty === account ? 'You' : formatAddress(swap.counterparty)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Deadline:</span>
                <span className="ml-2">
                  {new Date(swap.deadline * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapHistory; 