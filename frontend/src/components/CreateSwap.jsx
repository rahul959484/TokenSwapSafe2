import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Plus, Trash2, ArrowRight, Loader } from 'lucide-react';

const CreateSwap = ({ contract, account, provider, onSwapCreated }) => {
  const [formData, setFormData] = useState({
    counterparty: '',
    deadline: '',
    inputTokens: [''],
    inputAmounts: [''],
    outputTokens: [''],
    outputAmounts: ['']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, index, value) => {
    const newData = { ...formData };
    if (index !== undefined) {
      newData[field][index] = value;
    } else {
      newData[field] = value;
    }
    setFormData(newData);
  };

  const addTokenPair = () => {
    setFormData({
      ...formData,
      inputTokens: [...formData.inputTokens, ''],
      inputAmounts: [...formData.inputAmounts, ''],
      outputTokens: [...formData.outputTokens, ''],
      outputAmounts: [...formData.outputAmounts, '']
    });
  };

  const removeTokenPair = (index) => {
    const newData = { ...formData };
    newData.inputTokens.splice(index, 1);
    newData.inputAmounts.splice(index, 1);
    newData.outputTokens.splice(index, 1);
    newData.outputAmounts.splice(index, 1);
    setFormData(newData);
  };

  const validateForm = () => {
    if (!formData.counterparty) {
      setError('Counterparty address is required');
      return false;
    }
    if (!ethers.isAddress(formData.counterparty)) {
      setError('Invalid counterparty address');
      return false;
    }
    if (!formData.deadline) {
      setError('Deadline is required');
      return false;
    }
    if (new Date(formData.deadline) <= new Date()) {
      setError('Deadline must be in the future');
      return false;
    }
    if (formData.inputTokens.some(token => !token) || formData.outputTokens.some(token => !token)) {
      setError('All token addresses are required');
      return false;
    }
    if (formData.inputAmounts.some(amount => !amount || parseFloat(amount) <= 0) || 
        formData.outputAmounts.some(amount => !amount || parseFloat(amount) <= 0)) {
      setError('All amounts must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Convert deadline to timestamp
      const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);

      // Validate token addresses
      const inputTokens = formData.inputTokens.map(token => {
        if (!ethers.isAddress(token)) {
          throw new Error(`Invalid input token address: ${token}`);
        }
        return token;
      });

      const outputTokens = formData.outputTokens.map(token => {
        if (!ethers.isAddress(token)) {
          throw new Error(`Invalid output token address: ${token}`);
        }
        return token;
      });

      // Convert amounts to wei
      const inputAmounts = formData.inputAmounts.map(amount => 
        ethers.parseEther(amount.toString())
      );
      const outputAmounts = formData.outputAmounts.map(amount => 
        ethers.parseEther(amount.toString())
      );

      // Approve tokens first
      for (let i = 0; i < inputTokens.length; i++) {
        const tokenContract = new ethers.Contract(
          inputTokens[i],
          ['function approve(address spender, uint256 amount) returns (bool)'],
          await provider.getSigner()
        );
        
        const approveTx = await tokenContract.approve(await contract.getAddress(), inputAmounts[i]);
        await approveTx.wait();
      }

      // Create swap
      const tx = await contract.createSwap(
        formData.counterparty,
        inputTokens,
        inputAmounts,
        outputTokens,
        outputAmounts,
        deadline
      );

      const receipt = await tx.wait();
      
      // Find the SwapCreated event
      const event = receipt.logs.find(log => log.eventName === 'SwapCreated');
      if (event) {
        alert(`Swap created successfully! Swap ID: ${event.args.swapId}`);
        onSwapCreated();
        
        // Reset form
        setFormData({
          counterparty: '',
          deadline: '',
          inputTokens: [''],
          inputAmounts: [''],
          outputTokens: [''],
          outputAmounts: ['']
        });
      }
    } catch (error) {
      console.error('Error creating swap:', error);
      setError(error.message || 'Failed to create swap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Swap</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Counterparty Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Counterparty Address
          </label>
          <input
            type="text"
            value={formData.counterparty}
            onChange={(e) => handleInputChange('counterparty', undefined, e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', undefined, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Token Pairs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Token Pairs</h3>
            <button
              type="button"
              onClick={addTokenPair}
              className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Pair
            </button>
          </div>

          <div className="space-y-4">
            {formData.inputTokens.map((_, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Token
                  </label>
                  <input
                    type="text"
                    value={formData.inputTokens[index]}
                    onChange={(e) => handleInputChange('inputTokens', index, e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Amount
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.inputAmounts[index]}
                    onChange={(e) => handleInputChange('inputAmounts', index, e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Output Token
                    </label>
                    <input
                      type="text"
                      value={formData.outputTokens[index]}
                      onChange={(e) => handleInputChange('outputTokens', index, e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Output Amount
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.outputAmounts[index]}
                      onChange={(e) => handleInputChange('outputAmounts', index, e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {formData.inputTokens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTokenPair(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
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
              Creating Swap...
            </div>
          ) : (
            'Create Swap'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateSwap; 