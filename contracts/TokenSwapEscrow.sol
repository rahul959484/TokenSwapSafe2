// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwapEscrow is ReentrancyGuard, Ownable {
    
    struct Swap {
        address initiator;
        address counterparty;
        address[] inputTokens;
        uint256[] inputAmounts;
        address[] outputTokens;
        uint256[] outputAmounts;
        uint256 deadline;
        bool isActive;
        bool isCompleted;
        bool isCancelled;
    }
    
    mapping(bytes32 => Swap) public swaps;
    mapping(bytes32 => bool) public swapExists;
    
    event SwapCreated(
        bytes32 indexed swapId,
        address indexed initiator,
        address indexed counterparty,
        address[] inputTokens,
        uint256[] inputAmounts,
        address[] outputTokens,
        uint256[] outputAmounts,
        uint256 deadline
    );
    
    event SwapCompleted(bytes32 indexed swapId);
    event SwapCancelled(bytes32 indexed swapId);
    
    constructor() Ownable(msg.sender) {}
    
    function createSwap(
        address _counterparty,
        address[] memory _inputTokens,
        uint256[] memory _inputAmounts,
        address[] memory _outputTokens,
        uint256[] memory _outputAmounts,
        uint256 _deadline
    ) external returns (bytes32 swapId) {
        require(_counterparty != address(0), "Invalid counterparty");
        require(_inputTokens.length > 0, "No input tokens");
        require(_inputTokens.length == _inputAmounts.length, "Input arrays mismatch");
        require(_outputTokens.length > 0, "No output tokens");
        require(_outputTokens.length == _outputAmounts.length, "Output arrays mismatch");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        swapId = keccak256(abi.encodePacked(
            msg.sender,
            _counterparty,
            _inputTokens,
            _inputAmounts,
            _outputTokens,
            _outputAmounts,
            _deadline,
            block.timestamp
        ));
        
        require(!swapExists[swapId], "Swap already exists");
        
        swaps[swapId] = Swap({
            initiator: msg.sender,
            counterparty: _counterparty,
            inputTokens: _inputTokens,
            inputAmounts: _inputAmounts,
            outputTokens: _outputTokens,
            outputAmounts: _outputAmounts,
            deadline: _deadline,
            isActive: true,
            isCompleted: false,
            isCancelled: false
        });
        
        swapExists[swapId] = true;
        
        // Transfer input tokens from initiator to escrow
        for (uint i = 0; i < _inputTokens.length; i++) {
            require(_inputAmounts[i] > 0, "Amount must be greater than 0");
            IERC20(_inputTokens[i]).transferFrom(msg.sender, address(this), _inputAmounts[i]);
        }
        
        emit SwapCreated(
            swapId,
            msg.sender,
            _counterparty,
            _inputTokens,
            _inputAmounts,
            _outputTokens,
            _outputAmounts,
            _deadline
        );
    }
    
    function executeSwap(bytes32 _swapId) external nonReentrant {
        Swap storage swap = swaps[_swapId];
        require(swap.isActive, "Swap not active");
        require(!swap.isCompleted, "Swap already completed");
        require(!swap.isCancelled, "Swap cancelled");
        require(msg.sender == swap.counterparty, "Only counterparty can execute");
        require(block.timestamp <= swap.deadline, "Swap expired");
        
        // Transfer output tokens from counterparty to escrow
        for (uint i = 0; i < swap.outputTokens.length; i++) {
            IERC20(swap.outputTokens[i]).transferFrom(msg.sender, address(this), swap.outputAmounts[i]);
        }
        
        // Transfer input tokens to counterparty
        for (uint i = 0; i < swap.inputTokens.length; i++) {
            IERC20(swap.inputTokens[i]).transfer(swap.counterparty, swap.inputAmounts[i]);
        }
        
        // Transfer output tokens to initiator
        for (uint i = 0; i < swap.outputTokens.length; i++) {
            IERC20(swap.outputTokens[i]).transfer(swap.initiator, swap.outputAmounts[i]);
        }
        
        swap.isActive = false;
        swap.isCompleted = true;
        
        emit SwapCompleted(_swapId);
    }
    
    function cancelSwap(bytes32 _swapId) external {
        Swap storage swap = swaps[_swapId];
        require(swap.isActive, "Swap not active");
        require(!swap.isCompleted, "Swap already completed");
        require(!swap.isCancelled, "Swap already cancelled");
        require(
            msg.sender == swap.initiator || 
            (msg.sender == swap.counterparty && block.timestamp > swap.deadline),
            "Not authorized to cancel"
        );
        
        // Return input tokens to initiator
        for (uint i = 0; i < swap.inputTokens.length; i++) {
            IERC20(swap.inputTokens[i]).transfer(swap.initiator, swap.inputAmounts[i]);
        }
        
        swap.isActive = false;
        swap.isCancelled = true;
        
        emit SwapCancelled(_swapId);
    }
    
    function getSwap(bytes32 _swapId) external view returns (Swap memory) {
        require(swapExists[_swapId], "Swap does not exist");
        return swaps[_swapId];
    }
    
    // Emergency function for owner to recover stuck tokens
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
} 