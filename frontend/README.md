# TokenSwapSafe Frontend

A modern React frontend for the TokenSwapSafe escrow platform, built with Vite, Tailwind CSS, and Ethers.js.

## Features

- **Wallet Integration**: Connect with MetaMask or other Web3 wallets
- **Swap Creation**: Create new token swaps with multiple input/output tokens
- **Swap Execution**: Execute or cancel existing swaps
- **Swap History**: View and filter your swap history
- **Real-time Updates**: Live updates of swap status
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful, intuitive interface with Tailwind CSS

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Ethers.js** - Ethereum interaction
- **Lucide React** - Icons
- **Hardhat** - Smart contract development

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Deployed smart contracts

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm run frontend:install
   ```

2. **Compile contracts and copy artifacts:**
   ```bash
   npm run build
   ```

3. **Start the development server:**
   ```bash
   npm run frontend:dev
   ```

The frontend will be available at `http://localhost:5173`

### Development Workflow

1. **Deploy contracts:**
   ```bash
   npm run deploy
   ```

2. **Update contract address:**
   - Copy the deployed contract address from the deployment output
   - Update the `contractAddress` in `src/App.jsx`

3. **Start development:**
   ```bash
   npm run dev
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CreateSwap.jsx      # Swap creation form
│   │   ├── ExecuteSwap.jsx     # Swap execution interface
│   │   ├── SwapHistory.jsx     # Swap history display
│   │   ├── TokenSwapEscrow.jsx # Main swap interface
│   │   └── WalletConnect.jsx   # Wallet connection
│   ├── contracts/
│   │   ├── TokenSwapEscrow.json # Contract ABI
│   │   └── deployment.json     # Deployment info
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Custom styles
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── postcss.config.js           # PostCSS configuration
```

## Usage

### Connecting Wallet

1. Click "Connect MetaMask" button
2. Approve the connection in MetaMask
3. Your wallet address will be displayed

### Creating a Swap

1. Go to the "Create Swap" tab
2. Enter the counterparty's address
3. Set a deadline for the swap
4. Add token pairs (input → output)
5. Click "Create Swap"

### Executing a Swap

1. Go to the "Execute Swap" tab
2. Enter the swap ID
3. Review the swap details
4. Click "Execute Swap" or "Cancel Swap"

### Viewing History

1. Scroll down to "Swap History"
2. Use filters to view different swap states
3. Click on swaps to expand details

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_CONTRACT_ADDRESS=0x... # Deployed contract address
VITE_NETWORK_ID=31337       # Network ID (31337 for localhost)
```

### Contract Address

Update the contract address in `src/App.jsx`:

```javascript
const contractAddress = "0x..."; // Your deployed contract address
```

## Building for Production

```bash
npm run frontend:build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Common Issues

1. **"Contract not found" error:**
   - Make sure the contract is deployed
   - Check the contract address in `App.jsx`
   - Verify you're on the correct network

2. **"MetaMask not found" error:**
   - Install MetaMask browser extension
   - Make sure MetaMask is unlocked

3. **"Insufficient funds" error:**
   - Add test tokens to your wallet
   - Use a faucet for testnet tokens

4. **"Transaction failed" error:**
   - Check gas fees
   - Verify token approvals
   - Ensure sufficient token balance

### Debug Mode

Enable debug logging by adding to browser console:

```javascript
localStorage.setItem('debug', 'true');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 