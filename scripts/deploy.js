const hre = require("hardhat");

async function main() {
  console.log("Deploying TokenSwapSafe contracts...");

  // Deploy mock tokens
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  
  const tokenA = await MockERC20.deploy("Token A", "TKA");
  await tokenA.waitForDeployment();
  console.log("Token A deployed to:", await tokenA.getAddress());

  const tokenB = await MockERC20.deploy("Token B", "TKB");
  await tokenB.waitForDeployment();
  console.log("Token B deployed to:", await tokenB.getAddress());

  // Deploy escrow contract
  const TokenSwapEscrow = await hre.ethers.getContractFactory("TokenSwapEscrow");
  const escrow = await TokenSwapEscrow.deploy();
  await escrow.waitForDeployment();
  console.log("TokenSwapEscrow deployed to:", await escrow.getAddress());

  console.log("\nDeployment completed!");
  console.log("Token A:", await tokenA.getAddress());
  console.log("Token B:", await tokenB.getAddress());
  console.log("Escrow:", await escrow.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 