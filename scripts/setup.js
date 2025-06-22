#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TokenSwapSafe...\n');

// Check if Node.js version is sufficient
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Compile contracts
console.log('\n🔨 Compiling smart contracts...');
try {
  execSync('npm run compile', { stdio: 'inherit' });
  console.log('✅ Contracts compiled');
} catch (error) {
  console.error('❌ Failed to compile contracts');
  process.exit(1);
}

// Copy artifacts
console.log('\n📋 Copying contract artifacts...');
try {
  execSync('npm run copy-artifacts', { stdio: 'inherit' });
  console.log('✅ Artifacts copied');
} catch (error) {
  console.error('❌ Failed to copy artifacts');
  process.exit(1);
}

// Run tests
console.log('\n🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Tests passed');
} catch (error) {
  console.error('❌ Tests failed');
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start local blockchain: npm run node');
console.log('2. Deploy contracts (in new terminal): npm run deploy');
console.log('3. Update contract address in frontend/src/App.jsx');
console.log('4. Start frontend: npm run frontend:dev');
console.log('\n🌐 Frontend will be available at: http://localhost:5173');
console.log('\n📚 For more information, see README.md'); 