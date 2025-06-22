<<<<<<< HEAD
# TokenSwapSafe - Secure Escrow Smart Contract

A secure escrow smart contract for safely transacting multiple tokens between two parties on the Ethereum blockchain, with a modern React frontend.

## 🚀 Features

### Smart Contract Features
- **Multi-Token Support**: Swap multiple input tokens for multiple output tokens in a single transaction
- **Time-Limited Escrows**: Set deadlines for swap completion
- **Secure Execution**: Atomic swap execution ensures both parties receive their tokens or no one does
- **Cancellation Support**: Initiator can cancel anytime, counterparty can cancel after deadline
- **Reentrancy Protection**: Built-in security against reentrancy attacks
- **Emergency Recovery**: Owner can recover stuck tokens if needed

### Frontend Features
- **Wallet Integration**: Connect with MetaMask or other Web3 wallets
- **Swap Creation**: Create new token swaps with multiple input/output tokens
- **Swap Execution**: Execute or cancel existing swaps
- **Swap History**: View and filter your swap history
- **Real-time Updates**: Live updates of swap status
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful, intuitive interface with Tailwind CSS

## 🏗️ Architecture

```
TokenSwapSafe/
├── contracts/                 # Smart contracts
│   ├── TokenSwapEscrow.sol   # Main escrow contract
│   └── MockERC20.sol         # Test token contract
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contracts/        # Contract ABIs
│   │   └── App.jsx          # Main app
│   └── package.json
├── test/                     # Smart contract tests
├── scripts/                  # Deployment scripts
└── hardhat.config.js        # Hardhat configuration
```

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** - Smart contract language
- **Hardhat** - Development framework
- **OpenZeppelin** - Security libraries
- **Ethers.js** - Ethereum interaction

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Ethers.js** - Ethereum interaction
- **Lucide React** - Icons

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd TokenSwapSafe
   npm install
   npm run frontend:install
   ```

2. **Compile contracts:**
   ```bash
   npm run compile
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Start local blockchain:**
   ```bash
   npm run node
   ```

5. **Deploy contracts (in new terminal):**
   ```bash
   npm run deploy
   ```

6. **Copy contract artifacts to frontend:**
   ```bash
   npm run copy-artifacts
   ```

7. **Start frontend development server:**
   ```bash
   npm run frontend:dev
   ```

The frontend will be available at `http://localhost:5173`

### Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=your_sepolia_rpc_url
```

## 📖 Usage Examples

### Creating a Swap

```javascript
// Approve tokens first
await tokenA.approve(escrowAddress, amount);

// Create swap
const swapId = await escrow.createSwap(
  counterpartyAddress,
  [tokenAAddress],
  [ethers.parseEther("100")],
  [tokenBAddress],
  [ethers.parseEther("50")],
  deadline
);
```

### Executing a Swap

```javascript
// Approve output tokens
await tokenB.approve(escrowAddress, outputAmount);

// Execute swap
await escrow.executeSwap(swapId);
```

### Cancelling a Swap

```javascript
// Only initiator or counterparty after deadline
await escrow.cancelSwap(swapId);
```

## 🔧 Smart Contract Functions

### Core Functions

- `createSwap()` - Create a new escrow swap
- `executeSwap()` - Execute the swap (counterparty only)
- `cancelSwap()` - Cancel the swap and return tokens
- `getSwap()` - Get swap details

### Security Features

- ReentrancyGuard protection
- Input validation
- Deadline enforcement
- Authorization checks

## 🎨 Frontend Components

### Core Components

- `WalletConnect` - Wallet connection interface
- `TokenSwapEscrow` - Main swap interface with tabs
- `CreateSwap` - Swap creation form
- `ExecuteSwap` - Swap execution and cancellation
- `SwapHistory` - Swap history with filtering

### Features

- **Tabbed Interface**: Switch between creating and executing swaps
- **Dynamic Forms**: Add/remove token pairs dynamically
- **Real-time Validation**: Form validation with error messages
- **Status Indicators**: Visual status for all swap states
- **Responsive Design**: Works on all screen sizes

## 🧪 Testing

### Smart Contract Tests

Run the test suite:

```bash
npm test
```

Tests cover:
- Swap creation
- Swap execution
- Swap cancellation
- Error conditions
- Security scenarios

### Frontend Testing

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Local Development

```bash
npm run node
npm run deploy
npm run copy-artifacts
npm run frontend:dev
```

### Testnet Deployment

```bash
npm run deploy:testnet
```

### Production Build

```bash
npm run frontend:build
```

## 🔒 Security Considerations

- Always verify token addresses before creating swaps
- Set reasonable deadlines
- Test with small amounts first
- Review contract code before production use
- Use multi-sig wallets for large transactions
- Regularly audit smart contract code

## 📝 Contract Architecture

```
TokenSwapEscrow
├── Swap struct (stores swap details)
├── createSwap() (initiates escrow)
├── executeSwap() (completes swap)
├── cancelSwap() (cancels swap)
└── getSwap() (view swap details)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions or issues, please open an issue on GitHub.

## 🔗 Links

- [Smart Contract Documentation](./contracts/)
- [Frontend Documentation](./frontend/README.md)
- [Test Suite](./test/)
=======
# TokenSwapSafe - Secure Escrow Smart Contract

A secure escrow smart contract for safely transacting multiple tokens between two parties on the Ethereum blockchain, with a modern React frontend.

## 🚀 Features

### Smart Contract Features
- **Multi-Token Support**: Swap multiple input tokens for multiple output tokens in a single transaction
- **Time-Limited Escrows**: Set deadlines for swap completion
- **Secure Execution**: Atomic swap execution ensures both parties receive their tokens or no one does
- **Cancellation Support**: Initiator can cancel anytime, counterparty can cancel after deadline
- **Reentrancy Protection**: Built-in security against reentrancy attacks
- **Emergency Recovery**: Owner can recover stuck tokens if needed

### Frontend Features
- **Wallet Integration**: Connect with MetaMask or other Web3 wallets
- **Swap Creation**: Create new token swaps with multiple input/output tokens
- **Swap Execution**: Execute or cancel existing swaps
- **Swap History**: View and filter your swap history
- **Real-time Updates**: Live updates of swap status
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful, intuitive interface with Tailwind CSS

## 🏗️ Architecture

```
TokenSwapSafe/
├── contracts/                 # Smart contracts
│   ├── TokenSwapEscrow.sol   # Main escrow contract
│   └── MockERC20.sol         # Test token contract
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contracts/        # Contract ABIs
│   │   └── App.jsx          # Main app
│   └── package.json
├── test/                     # Smart contract tests
├── scripts/                  # Deployment scripts
└── hardhat.config.js        # Hardhat configuration
```

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** - Smart contract language
- **Hardhat** - Development framework
- **OpenZeppelin** - Security libraries
- **Ethers.js** - Ethereum interaction

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Ethers.js** - Ethereum interaction
- **Lucide React** - Icons

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd TokenSwapSafe
   npm install
   npm run frontend:install
   ```

2. **Compile contracts:**
   ```bash
   npm run compile
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Start local blockchain:**
   ```bash
   npm run node
   ```

5. **Deploy contracts (in new terminal):**
   ```bash
   npm run deploy
   ```

6. **Copy contract artifacts to frontend:**
   ```bash
   npm run copy-artifacts
   ```

7. **Start frontend development server:**
   ```bash
   npm run frontend:dev
   ```

The frontend will be available at `http://localhost:5173`

### Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=your_sepolia_rpc_url
```

## 📖 Usage Examples

### Creating a Swap

```javascript
// Approve tokens first
await tokenA.approve(escrowAddress, amount);

// Create swap
const swapId = await escrow.createSwap(
  counterpartyAddress,
  [tokenAAddress],
  [ethers.parseEther("100")],
  [tokenBAddress],
  [ethers.parseEther("50")],
  deadline
);
```

### Executing a Swap

```javascript
// Approve output tokens
await tokenB.approve(escrowAddress, outputAmount);

// Execute swap
await escrow.executeSwap(swapId);
```

### Cancelling a Swap

```javascript
// Only initiator or counterparty after deadline
await escrow.cancelSwap(swapId);
```

## 🔧 Smart Contract Functions

### Core Functions

- `createSwap()` - Create a new escrow swap
- `executeSwap()` - Execute the swap (counterparty only)
- `cancelSwap()` - Cancel the swap and return tokens
- `getSwap()` - Get swap details

### Security Features

- ReentrancyGuard protection
- Input validation
- Deadline enforcement
- Authorization checks

## 🎨 Frontend Components

### Core Components

- `WalletConnect` - Wallet connection interface
- `TokenSwapEscrow` - Main swap interface with tabs
- `CreateSwap` - Swap creation form
- `ExecuteSwap` - Swap execution and cancellation
- `SwapHistory` - Swap history with filtering

### Features

- **Tabbed Interface**: Switch between creating and executing swaps
- **Dynamic Forms**: Add/remove token pairs dynamically
- **Real-time Validation**: Form validation with error messages
- **Status Indicators**: Visual status for all swap states
- **Responsive Design**: Works on all screen sizes

## 🧪 Testing

### Smart Contract Tests

Run the test suite:

```bash
npm test
```

Tests cover:
- Swap creation
- Swap execution
- Swap cancellation
- Error conditions
- Security scenarios

### Frontend Testing

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Local Development

```bash
npm run node
npm run deploy
npm run copy-artifacts
npm run frontend:dev
```

### Testnet Deployment

```bash
npm run deploy:testnet
```

### Production Build

```bash
npm run frontend:build
```

## 🔒 Security Considerations

- Always verify token addresses before creating swaps
- Set reasonable deadlines
- Test with small amounts first
- Review contract code before production use
- Use multi-sig wallets for large transactions
- Regularly audit smart contract code

## 📝 Contract Architecture

```
TokenSwapEscrow
├── Swap struct (stores swap details)
├── createSwap() (initiates escrow)
├── executeSwap() (completes swap)
├── cancelSwap() (cancels swap)
└── getSwap() (view swap details)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions or issues, please open an issue on GitHub.

## 🔗 Links

- [Smart Contract Documentation](./contracts/)
- [Frontend Documentation](./frontend/README.md)
- [Test Suite](./test/)
>>>>>>> 8f8330bc796178e845ed4295fd03596e3bdcd98c
- [Deployment Scripts](./scripts/) 