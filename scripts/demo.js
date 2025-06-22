const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🎭 TokenSwapSafe Demo\n");

  // Get signers
  const [owner, alice, bob] = await ethers.getSigners();
  
  console.log("👥 Participants:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Alice: ${alice.address}`);
  console.log(`Bob: ${bob.address}\n`);

  // Deploy contracts
  console.log("📦 Deploying contracts...");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const tokenA = await MockERC20.deploy("Token A", "TKA");
  const tokenB = await MockERC20.deploy("Token B", "TKB");
  
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  
  const TokenSwapEscrow = await ethers.getContractFactory("TokenSwapEscrow");
  const escrow = await TokenSwapEscrow.deploy();
  await escrow.waitForDeployment();
  
  console.log(`Token A deployed to: ${await tokenA.getAddress()}`);
  console.log(`Token B deployed to: ${await tokenB.getAddress()}`);
  console.log(`Escrow deployed to: ${await escrow.getAddress()}\n`);

  // Transfer tokens to participants
  console.log("💰 Distributing tokens...");
  
  await tokenA.transfer(alice.address, ethers.parseEther("1000"));
  await tokenB.transfer(bob.address, ethers.parseEther("1000"));
  
  console.log(`Alice received ${ethers.formatEther(await tokenA.balanceOf(alice.address))} Token A`);
  console.log(`Bob received ${ethers.formatEther(await tokenB.balanceOf(bob.address))} Token B\n`);

  // Alice creates a swap
  console.log("🔄 Alice creates a swap...");
  
  const inputTokens = [await tokenA.getAddress()];
  const inputAmounts = [ethers.parseEther("100")];
  const outputTokens = [await tokenB.getAddress()];
  const outputAmounts = [ethers.parseEther("50")];
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  
  // Alice approves tokens
  await tokenA.connect(alice).approve(await escrow.getAddress(), inputAmounts[0]);
  
  const createTx = await escrow.connect(alice).createSwap(
    bob.address,
    inputTokens,
    inputAmounts,
    outputTokens,
    outputAmounts,
    deadline
  );
  
  const createReceipt = await createTx.wait();
  const createEvent = createReceipt.logs.find(log => log.eventName === "SwapCreated");
  const swapId = createEvent.args.swapId;
  
  console.log(`Swap created with ID: ${swapId}`);
  console.log(`Alice offers 100 Token A for 50 Token B\n`);

  // Check swap details
  console.log("📋 Swap details:");
  const swap = await escrow.getSwap(swapId);
  console.log(`Initiator: ${swap.initiator}`);
  console.log(`Counterparty: ${swap.counterparty}`);
  console.log(`Status: ${swap.isActive ? 'Active' : 'Inactive'}`);
  console.log(`Completed: ${swap.isCompleted}`);
  console.log(`Cancelled: ${swap.isCancelled}\n`);

  // Bob executes the swap
  console.log("✅ Bob executes the swap...");
  
  // Bob approves tokens
  await tokenB.connect(bob).approve(await escrow.getAddress(), outputAmounts[0]);
  
  const executeTx = await escrow.connect(bob).executeSwap(swapId);
  await executeTx.wait();
  
  console.log("Swap executed successfully!\n");

  // Check final balances
  console.log("💰 Final balances:");
  console.log(`Alice Token A: ${ethers.formatEther(await tokenA.balanceOf(alice.address))}`);
  console.log(`Alice Token B: ${ethers.formatEther(await tokenB.balanceOf(alice.address))}`);
  console.log(`Bob Token A: ${ethers.formatEther(await tokenA.balanceOf(bob.address))}`);
  console.log(`Bob Token B: ${ethers.formatEther(await tokenB.balanceOf(bob.address))}\n`);

  // Check swap status
  const finalSwap = await escrow.getSwap(swapId);
  console.log("📋 Final swap status:");
  console.log(`Active: ${finalSwap.isActive}`);
  console.log(`Completed: ${finalSwap.isCompleted}`);
  console.log(`Cancelled: ${finalSwap.isCancelled}\n`);

  console.log("🎉 Demo completed successfully!");
  console.log("\n💡 This demonstrates:");
  console.log("- Token approval and transfer");
  console.log("- Swap creation with deadline");
  console.log("- Atomic swap execution");
  console.log("- Balance verification");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }); 