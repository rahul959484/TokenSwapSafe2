import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Search, CheckCircle, XCircle, Clock, Loader, AlertCircle } from 'lucide-react';

const ExecuteSwap = ({ contract, account, provider, onSwapExecuted, onSwapCancelled }) => {
  const [swapId, setSwapId] = useState('');
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const fetchSwap = async () => {
    if (!swapId || !contract) return;

    try {
      setLoading(true);
      setError('');
      
      const swapData = await contract.getSwap(swapId);
      setSwap(swapData);
    } catch (error) {
      console.error('Error fetching swap:', error);
      setError('Swap not found or invalid swap ID');
      setSwap(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!contract || !swap) return;

    try {
      setExecuting(true);
      setError('');

      // Approve output tokens first
      for (let i = 0; i < swap.outputTokens.length; i++) {
        const tokenContract = new ethers.Contract(
          swap.outputTokens[i],
          ['function approve(address spender, uint256 amount) returns (bool)'],
          await provider.getSigner()
        );
        
        const approveTx = await tokenContract.approve(await contract.getAddress(), swap.outputAmounts[i]);
        await approveTx.wait();
      }

      // Execute swap
      const tx = await contract.executeSwap(swapId);
      await tx.wait();
      
      alert('Swap executed successfully!');
      onSwapExecuted();
      setSwap(null);
      setSwapId('');
    } catch (error) {
      console.error('Error executing swap:', error);
      setError(error.message || 'Failed to execute swap');
    } finally {
      setExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!contract || !swap) return;

    try {
      setCancelling(true);
      setError('');

      const tx = await contract.cancelSwap(swapId);
      await tx.wait();
      
      alert('Swap cancelled successfully!');
      onSwapCancelled();
      setSwap(null);
      setSwapId('');
    } catch (error) {
      console.error('Error cancelling swap:', error);
      setError(error.message || 'Failed to cancel swap');
    } finally {
      setCancelling(false);
    }
  };

  const canExecute = swap && 
    swap.isActive && 
    !swap.isCompleted && 
    !swap.isCancelled && 
    swap.counterparty === account &&
    swap.deadline >= Math.floor(Date.now() / 1000);

  const canCancel = swap && 
    swap.isActive && 
    !swap.isCompleted && 
    !swap.isCancelled && 
    (swap.initiator === account || 
     (swap.counterparty === account && swap.deadline < Math.floor(Date.now() / 1000)));

  const isExpired = swap && swap.deadline < Math.floor(Date.now() / 1000);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Execute or Cancel Swap</h2>
      
      {/* Search Form */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={swapId}
            onChange={(e) => setSwapId(e.target.value)}
            placeholder="Enter Swap ID..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={fetchSwap}
            disabled={!swapId || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Swap Details */}
      {swap && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {swap.isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              ) : swap.isCancelled ? (
                <XCircle className="w-6 h-6 text-red-600 mr-2" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-600 mr-2" />
              )}
              <span className="font-medium">
                {swap.isCompleted ? 'Completed' : swap.isCancelled ? 'Cancelled' : 'Active'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ID: {swapId.slice(0, 8)}...
            </span>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Initiator</h4>
              <p className="text-sm text-gray-600 font-mono">
                {swap.initiator === account ? 'You' : swap.initiator}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Counterparty</h4>
              <p className="text-sm text-gray-600 font-mono">
                {swap.counterparty === account ? 'You' : swap.counterparty}
              </p>
            </div>
          </div>

          {/* Token Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Input Tokens (Initiator's)</h4>
              <div className="space-y-2">
                {swap.inputTokens.map((token, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">Token {index + 1}:</span>
                    <span className="font-mono">
                      {ethers.formatEther(swap.inputAmounts[index])} {token.slice(0, 6)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Output Tokens (Counterparty's)</h4>
              <div className="space-y-2">
                {swap.outputTokens.map((token, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">Token {index + 1}:</span>
                    <span className="font-mono">
                      {ethers.formatEther(swap.outputAmounts[index])} {token.slice(0, 6)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Deadline: {new Date(swap.deadline * 1000).toLocaleString()}
              </span>
              {isExpired && (
                <span className="text-sm text-red-600 font-medium">EXPIRED</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!swap.isCompleted && !swap.isCancelled && (
            <div className="flex space-x-3 pt-4">
              {canExecute && (
                <button
                  onClick={handleExecute}
                  disabled={executing}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {executing ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </div>
                  ) : (
                    'Execute Swap'
                  )}
                </button>
              )}
              
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </div>
                  ) : (
                    'Cancel Swap'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* No Swap Found */}
      {!swap && !loading && !error && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Enter a swap ID to view details</p>
        </div>
      )}
    </div>
  );
};

export default ExecuteSwap; 