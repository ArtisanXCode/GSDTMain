
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("GSDC Integration Tests", function () {
  let gsdc: Contract;
  let gsdcProxy: Contract;
  let multiSig: Contract;
  let owner: Signer;
  let admin: Signer;
  let minter: Signer;
  let approver: Signer;
  let user1: Signer;
  let user2: Signer;
  let ownerAddress: string;
  let adminAddress: string;
  let minterAddress: string;
  let approverAddress: string;
  let user1Address: string;
  let user2Address: string;

  const MINT_AMOUNT = ethers.utils.parseEther("10000");
  const COOLDOWN_PERIOD = 90 * 60; // 90 minutes

  beforeEach(async function () {
    [owner, admin, minter, approver, user1, user2] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    adminAddress = await admin.getAddress();
    minterAddress = await minter.getAddress();
    approverAddress = await approver.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    // Deploy GSDC implementation
    const GSDC = await ethers.getContractFactory("GSDC");
    const gsdcImplementation = await GSDC.deploy();
    await gsdcImplementation.deployed();

    // Deploy proxy
    const GSDCProxy = await ethers.getContractFactory("GSDCProxy");
    const initializeData = gsdcImplementation.interface.encodeFunctionData("initialize", [ownerAddress]);
    gsdcProxy = await GSDCProxy.deploy(gsdcImplementation.address, initializeData);
    await gsdcProxy.deployed();

    // Attach GSDC interface to proxy
    gsdc = GSDC.attach(gsdcProxy.address);

    // Deploy MultiSigAdministrative
    const MultiSigAdministrative = await ethers.getContractFactory("MultiSigAdministrative");
    multiSig = await MultiSigAdministrative.deploy(gsdc.address);
    await multiSig.deployed();

    // Transfer GSDC ownership to MultiSig
    await gsdc.transferOwnership(multiSig.address);

    // Grant roles in MultiSig
    const ADMIN_ROLE = await multiSig.ADMIN_ROLE();
    const MINTER_ROLE = await multiSig.MINTER_ROLE();
    const APPROVER_ROLE = await multiSig.APPROVER_ROLE();

    await multiSig.grantRole(ADMIN_ROLE, adminAddress);
    await multiSig.grantRole(MINTER_ROLE, minterAddress);
    await multiSig.grantRole(APPROVER_ROLE, approverAddress);
  });

  describe("Complete Workflow", function () {
    it("Should handle complete mint-transfer-burn workflow", async function () {
      // Step 1: Mint tokens through MultiSig
      const mintTx = await multiSig.connect(minter).mintTokens(user1Address, MINT_AMOUNT);
      const mintReceipt = await mintTx.wait();
      const mintEvent = mintReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId = mintEvent?.args?.txId;

      // Approve the mint
      await multiSig.connect(approver).approveTransaction(mintTxId);

      // Verify tokens were minted
      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT);
      expect(await gsdc.totalSupply()).to.equal(MINT_AMOUNT);

      // Step 2: Transfer tokens between users
      const transferAmount = ethers.utils.parseEther("3000");
      await gsdc.connect(user1).transfer(user2Address, transferAmount);

      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT.sub(transferAmount));
      expect(await gsdc.balanceOf(user2Address)).to.equal(transferAmount);

      // Step 3: User burns their own tokens
      const burnAmount = ethers.utils.parseEther("1000");
      await gsdc.connect(user2).burn(burnAmount);

      expect(await gsdc.balanceOf(user2Address)).to.equal(transferAmount.sub(burnAmount));
      expect(await gsdc.totalSupply()).to.equal(MINT_AMOUNT.sub(burnAmount));

      // Step 4: Admin burns remaining tokens through MultiSig
      const remainingBalance = await gsdc.balanceOf(user2Address);
      await gsdc.connect(user2).approve(multiSig.address, remainingBalance);

      const burnerRole = await multiSig.BURNER_ROLE();
      await multiSig.grantRole(burnerRole, adminAddress);

      const burnTx = await multiSig.connect(admin).burnTokens(user2Address, remainingBalance);
      const burnReceipt = await burnTx.wait();
      const burnEvent = burnReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const burnTxId = burnEvent?.args?.txId;

      await multiSig.connect(approver).approveTransaction(burnTxId);

      expect(await gsdc.balanceOf(user2Address)).to.equal(0);
    });

    it("Should handle blacklist workflow", async function () {
      // Step 1: Mint tokens to user
      const mintTx = await multiSig.connect(minter).mintTokens(user1Address, MINT_AMOUNT);
      const mintReceipt = await mintTx.wait();
      const mintEvent = mintReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId = mintEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(mintTxId);

      // Step 2: Blacklist the user
      const blacklistRole = await multiSig.BLACKLIST_MANAGER_ROLE();
      await multiSig.grantRole(blacklistRole, adminAddress);

      const blacklistTx = await multiSig.connect(admin).setBlacklistStatus(user1Address, true);
      const blacklistReceipt = await blacklistTx.wait();
      const blacklistEvent = blacklistReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const blacklistTxId = blacklistEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(blacklistTxId);

      // Step 3: Verify user cannot transfer
      await expect(gsdc.connect(user1).transfer(user2Address, ethers.utils.parseEther("100")))
        .to.be.revertedWith("GSDC: Address is blacklisted");

      // Step 4: Admin burns blacklisted user's tokens
      const burnerRole = await multiSig.BURNER_ROLE();
      await multiSig.grantRole(burnerRole, adminAddress);

      const burnBlacklistedTx = await multiSig.connect(admin).burnBlacklistedTokens(user1Address, MINT_AMOUNT);
      const burnBlacklistedReceipt = await burnBlacklistedTx.wait();
      const burnBlacklistedEvent = burnBlacklistedReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const burnBlacklistedTxId = burnBlacklistedEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(burnBlacklistedTxId);

      expect(await gsdc.balanceOf(user1Address)).to.equal(0);
    });

    it("Should handle freeze/unfreeze workflow", async function () {
      // Step 1: Mint tokens to user
      const mintTx = await multiSig.connect(minter).mintTokens(user1Address, MINT_AMOUNT);
      const mintReceipt = await mintTx.wait();
      const mintEvent = mintReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId = mintEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(mintTxId);

      // Step 2: Freeze the user
      const freezeRole = await multiSig.FREEZE_MANAGER_ROLE();
      await multiSig.grantRole(freezeRole, adminAddress);

      const freezeTx = await multiSig.connect(admin).freezeAddress(user1Address);
      const freezeReceipt = await freezeTx.wait();
      const freezeEvent = freezeReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const freezeTxId = freezeEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(freezeTxId);

      // Step 3: Verify user cannot perform operations
      await expect(gsdc.connect(user1).transfer(user2Address, ethers.utils.parseEther("100")))
        .to.be.revertedWith("GSDC: Address is frozen");

      await expect(gsdc.connect(user1).burn(ethers.utils.parseEther("100")))
        .to.be.revertedWith("GSDC: Address is frozen");

      // Step 4: Unfreeze the user
      const unfreezeTx = await multiSig.connect(admin).unfreezeAddress(user1Address);
      const unfreezeReceipt = await unfreezeTx.wait();
      const unfreezeEvent = unfreezeReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const unfreezeTxId = unfreezeEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(unfreezeTxId);

      // Step 5: Verify user can perform operations again
      await expect(gsdc.connect(user1).transfer(user2Address, ethers.utils.parseEther("100")))
        .to.not.be.reverted;

      expect(await gsdc.balanceOf(user2Address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should handle emergency pause scenario", async function () {
      // Step 1: Mint tokens
      const mintTx = await multiSig.connect(minter).mintTokens(user1Address, MINT_AMOUNT);
      const mintReceipt = await mintTx.wait();
      const mintEvent = mintReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId = mintEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(mintTxId);

      // Step 2: Emergency pause MultiSig
      await multiSig.connect(admin).emergencyPause();

      // Step 3: Verify operations are blocked in MultiSig
      await expect(multiSig.connect(minter).mintTokens(user2Address, MINT_AMOUNT))
        .to.be.revertedWith("Pausable: paused");

      // Step 4: Token operations should still work (GSDC not paused)
      await expect(gsdc.connect(user1).transfer(user2Address, ethers.utils.parseEther("100")))
        .to.not.be.reverted;

      // Step 5: Unpause and verify operations resume
      await multiSig.connect(admin).emergencyUnpause();

      await expect(multiSig.connect(minter).mintTokens(user2Address, MINT_AMOUNT))
        .to.not.be.reverted;
    });

    it("Should handle multiple pending transactions", async function () {
      // Create multiple pending transactions
      const mintTx1 = await multiSig.connect(minter).mintTokens(user1Address, MINT_AMOUNT);
      const mintTx2 = await multiSig.connect(minter).mintTokens(user2Address, MINT_AMOUNT);
      
      const blacklistRole = await multiSig.BLACKLIST_MANAGER_ROLE();
      await multiSig.grantRole(blacklistRole, adminAddress);
      const blacklistTx = await multiSig.connect(admin).setBlacklistStatus(user1Address, true);

      // Verify pending transactions
      const pendingIds = await multiSig.getPendingTransactionIds();
      expect(pendingIds.length).to.equal(3);

      // Approve one transaction
      const mintReceipt1 = await mintTx1.wait();
      const mintEvent1 = mintReceipt1.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId1 = mintEvent1?.args?.txId;
      await multiSig.connect(approver).approveTransaction(mintTxId1);

      // Reject one transaction
      const mintReceipt2 = await mintTx2.wait();
      const mintEvent2 = mintReceipt2.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId2 = mintEvent2?.args?.txId;
      await multiSig.connect(approver).rejectTransaction(mintTxId2, "Test rejection");

      // Execute one transaction after cooldown
      const blacklistReceipt = await blacklistTx.wait();
      const blacklistEvent = blacklistReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const blacklistTxId = blacklistEvent?.args?.txId;
      
      await time.increase(COOLDOWN_PERIOD + 1);
      await multiSig.executeTransaction(blacklistTxId);

      // Verify final states
      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT);
      expect(await gsdc.balanceOf(user2Address)).to.equal(0);
      expect(await multiSig.isBlacklisted(user1Address)).to.be.true;

      const finalPendingIds = await multiSig.getPendingTransactionIds();
      expect(finalPendingIds.length).to.equal(0);
    });

    it("Should handle redemption workflow", async function () {
      // Step 1: Mint tokens to user
      const mintTx = await multiSig.connect(minter).mintTokens(user1Address, MINT_AMOUNT);
      const mintReceipt = await mintTx.wait();
      const mintEvent = mintReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId = mintEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(mintTxId);

      // Step 2: User requests redemption
      const redeemAmount = ethers.utils.parseEther("5000");
      await multiSig.connect(user1).requestRedemption(redeemAmount);

      // Step 3: User approves burn for redemption
      await gsdc.connect(user1).approve(multiSig.address, redeemAmount);

      // Step 4: Admin processes redemption
      await multiSig.connect(admin).processRedemption(1, true);

      // Step 5: Verify redemption processed (this would queue a burn transaction)
      const request = await multiSig.redemptionRequests(1);
      expect(request.processed).to.be.true;
      expect(request.approved).to.be.true;

      // The burn would be queued, so we need to approve it
      const pendingIds = await multiSig.getPendingTransactionIds();
      if (pendingIds.length > 0) {
        await multiSig.connect(approver).approveTransaction(pendingIds[0]);
        expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT.sub(redeemAmount));
      }
    });
  });

  describe("Stress Testing", function () {
    it("Should handle rapid sequential operations", async function () {
      const numOperations = 10;
      const mintAmount = ethers.utils.parseEther("1000");

      // Rapidly queue multiple mint operations
      for (let i = 0; i < numOperations; i++) {
        await multiSig.connect(minter).mintTokens(user1Address, mintAmount);
      }

      // Verify all transactions were queued
      const pendingIds = await multiSig.getPendingTransactionIds();
      expect(pendingIds.length).to.equal(numOperations);

      // Approve all transactions
      for (const txId of pendingIds) {
        await multiSig.connect(approver).approveTransaction(txId);
      }

      // Verify final balance
      expect(await gsdc.balanceOf(user1Address)).to.equal(mintAmount.mul(numOperations));
    });

    it("Should handle large token amounts", async function () {
      const largeAmount = ethers.utils.parseEther("999999"); // Just under max
      
      const mintTx = await multiSig.connect(minter).mintTokens(user1Address, largeAmount);
      const mintReceipt = await mintTx.wait();
      const mintEvent = mintReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const mintTxId = mintEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(mintTxId);

      expect(await gsdc.balanceOf(user1Address)).to.equal(largeAmount);
      expect(await gsdc.totalSupply()).to.equal(largeAmount);
    });
  });
});
