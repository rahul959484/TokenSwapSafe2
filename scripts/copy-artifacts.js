const fs = require('fs');
const path = require('path');

// Function to copy contract artifacts to frontend
function copyArtifacts() {
  const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
  const frontendContractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');
  
  // Create frontend contracts directory if it doesn't exist
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }
  
  // Copy TokenSwapEscrow.json
  const escrowArtifactPath = path.join(artifactsDir, 'TokenSwapEscrow.sol', 'TokenSwapEscrow.json');
  const frontendEscrowPath = path.join(frontendContractsDir, 'TokenSwapEscrow.json');
  
  if (fs.existsSync(escrowArtifactPath)) {
    fs.copyFileSync(escrowArtifactPath, frontendEscrowPath);
    console.log('✅ TokenSwapEscrow.json copied to frontend');
  } else {
    console.log('⚠️  TokenSwapEscrow.json not found in artifacts');
  }
  
  // Copy MockERC20.json
  const mockTokenArtifactPath = path.join(artifactsDir, 'MockERC20.sol', 'MockERC20.json');
  const frontendMockTokenPath = path.join(frontendContractsDir, 'MockERC20.json');
  
  if (fs.existsSync(mockTokenArtifactPath)) {
    fs.copyFileSync(mockTokenArtifactPath, frontendMockTokenPath);
    console.log('✅ MockERC20.json copied to frontend');
  } else {
    console.log('⚠️  MockERC20.json not found in artifacts');
  }
  
  // Create deployment info file
  const deploymentInfo = {
    network: process.env.NETWORK || 'localhost',
    timestamp: new Date().toISOString(),
    contracts: {
      TokenSwapEscrow: {
        address: process.env.ESCROW_ADDRESS || '0x...',
        abi: 'TokenSwapEscrow.json'
      },
      MockERC20: {
        address: process.env.MOCK_TOKEN_ADDRESS || '0x...',
        abi: 'MockERC20.json'
      }
    }
  };
  
  const deploymentInfoPath = path.join(frontendContractsDir, 'deployment.json');
  fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('✅ deployment.json created');
}

// Run the copy function
try {
  copyArtifacts();
  console.log('🎉 Contract artifacts copied successfully!');
} catch (error) {
  console.error('❌ Error copying artifacts:', error);
  process.exit(1);
} 