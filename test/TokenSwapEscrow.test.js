const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenSwapEscrow", function () {
  let TokenSwapEscrow, MockERC20;
  let escrow, tokenA, tokenB;
  let owner, initiator, counterparty;
  let initiatorSigner, counterpartySigner;

  beforeEach(async function () {
    [owner, initiator, counterparty] = await ethers.getSigners();
    
    TokenSwapEscrow = await ethers.getContractFactory("TokenSwapEscrow");
    MockERC20 = await ethers.getContractFactory("MockERC20");
    
    escrow = await TokenSwapEscrow.deploy();
    tokenA = await MockERC20.deploy("Token A", "TKA");
    tokenB = await MockERC20.deploy("Token B", "TKB");
    
    // Transfer some tokens to initiator and counterparty
    await tokenA.transfer(initiator.address, ethers.parseEther("1000"));
    await tokenB.transfer(counterparty.address, ethers.parseEther("1000"));
    
    initiatorSigner = await ethers.getSigner(initiator.address);
    counterpartySigner = await ethers.getSigner(counterparty.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
    });
  });

  describe("Swap Creation", function () {
    it("Should create a swap successfully", async function () {
      const inputTokens = [await tokenA.getAddress()];
      const inputAmounts = [ethers.parseEther("100")];
      const outputTokens = [await tokenB.getAddress()];
      const outputAmounts = [ethers.parseEther("50")];
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      // Approve tokens
      await tokenA.connect(initiatorSigner).approve(await escrow.getAddress(), inputAmounts[0]);

      const tx = await escrow.connect(initiatorSigner).createSwap(
        counterparty.address,
        inputTokens,
        inputAmounts,
        outputTokens,
        outputAmounts,
        deadline
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === "SwapCreated");
      expect(event).to.not.be.undefined;

      const swapId = event.args.swapId;
      const swap = await escrow.getSwap(swapId);
      
      expect(swap.initiator).to.equal(initiator.address);
      expect(swap.counterparty).to.equal(counterparty.address);
      expect(swap.isActive).to.be.true;
    });

    it("Should fail with invalid counterparty", async function () {
      const inputTokens = [await tokenA.getAddress()];
      const inputAmounts = [ethers.parseEther("100")];
      const outputTokens = [await tokenB.getAddress()];
      const outputAmounts = [ethers.parseEther("50")];
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await tokenA.connect(initiatorSigner).approve(await escrow.getAddress(), inputAmounts[0]);

      await expect(
        escrow.connect(initiatorSigner).createSwap(
          ethers.ZeroAddress,
          inputTokens,
          inputAmounts,
          outputTokens,
          outputAmounts,
          deadline
        )
      ).to.be.revertedWith("Invalid counterparty");
    });
  });

  describe("Swap Execution", function () {
    let swapId;

    beforeEach(async function () {
      const inputTokens = [await tokenA.getAddress()];
      const inputAmounts = [ethers.parseEther("100")];
      const outputTokens = [await tokenB.getAddress()];
      const outputAmounts = [ethers.parseEther("50")];
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await tokenA.connect(initiatorSigner).approve(await escrow.getAddress(), inputAmounts[0]);

      const tx = await escrow.connect(initiatorSigner).createSwap(
        counterparty.address,
        inputTokens,
        inputAmounts,
        outputTokens,
        outputAmounts,
        deadline
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === "SwapCreated");
      swapId = event.args.swapId;
    });

    it("Should execute swap successfully", async function () {
      const swap = await escrow.getSwap(swapId);
      
      // Approve output tokens
      await tokenB.connect(counterpartySigner).approve(await escrow.getAddress(), swap.outputAmounts[0]);

      const initiatorBalanceBefore = await tokenB.balanceOf(initiator.address);
      const counterpartyBalanceBefore = await tokenA.balanceOf(counterparty.address);

      const tx = await escrow.connect(counterpartySigner).executeSwap(swapId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => log.eventName === "SwapCompleted");
      expect(event).to.not.be.undefined;

      const initiatorBalanceAfter = await tokenB.balanceOf(initiator.address);
      const counterpartyBalanceAfter = await tokenA.balanceOf(counterparty.address);

      expect(initiatorBalanceAfter).to.equal(initiatorBalanceBefore + swap.outputAmounts[0]);
      expect(counterpartyBalanceAfter).to.equal(counterpartyBalanceBefore + swap.inputAmounts[0]);
    });

    it("Should fail if executed by non-counterparty", async function () {
      await expect(
        escrow.connect(initiatorSigner).executeSwap(swapId)
      ).to.be.revertedWith("Only counterparty can execute");
    });
  });

  describe("Swap Cancellation", function () {
    let swapId;

    beforeEach(async function () {
      const inputTokens = [await tokenA.getAddress()];
      const inputAmounts = [ethers.parseEther("100")];
      const outputTokens = [await tokenB.getAddress()];
      const outputAmounts = [ethers.parseEther("50")];
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await tokenA.connect(initiatorSigner).approve(await escrow.getAddress(), inputAmounts[0]);

      const tx = await escrow.connect(initiatorSigner).createSwap(
        counterparty.address,
        inputTokens,
        inputAmounts,
        outputTokens,
        outputAmounts,
        deadline
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === "SwapCreated");
      swapId = event.args.swapId;
    });

    it("Should allow initiator to cancel", async function () {
      const initiatorBalanceBefore = await tokenA.balanceOf(initiator.address);

      const tx = await escrow.connect(initiatorSigner).cancelSwap(swapId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => log.eventName === "SwapCancelled");
      expect(event).to.not.be.undefined;

      const initiatorBalanceAfter = await tokenA.balanceOf(initiator.address);
      expect(initiatorBalanceAfter).to.be.gt(initiatorBalanceBefore);
    });

    it("Should not allow counterparty to cancel before deadline", async function () {
      await expect(
        escrow.connect(counterpartySigner).cancelSwap(swapId)
      ).to.be.revertedWith("Not authorized to cancel");
    });
  });
}); 