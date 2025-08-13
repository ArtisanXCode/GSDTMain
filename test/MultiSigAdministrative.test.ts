
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MultiSigAdministrative Contract", function () {
  let gsdc: Contract;
  let gsdcProxy: Contract;
  let multiSig: Contract;
  let owner: Signer;
  let admin: Signer;
  let minter: Signer;
  let burner: Signer;
  let approver: Signer;
  let user: Signer;
  let ownerAddress: string;
  let adminAddress: string;
  let minterAddress: string;
  let burnerAddress: string;
  let approverAddress: string;
  let userAddress: string;

  const MINT_AMOUNT = ethers.utils.parseEther("1000");
  const COOLDOWN_PERIOD = 90 * 60; // 90 minutes

  beforeEach(async function () {
    [owner, admin, minter, burner, approver, user] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    adminAddress = await admin.getAddress();
    minterAddress = await minter.getAddress();
    burnerAddress = await burner.getAddress();
    approverAddress = await approver.getAddress();
    userAddress = await user.getAddress();

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

    // Grant roles
    const ADMIN_ROLE = await multiSig.ADMIN_ROLE();
    const MINTER_ROLE = await multiSig.MINTER_ROLE();
    const BURNER_ROLE = await multiSig.BURNER_ROLE();
    const APPROVER_ROLE = await multiSig.APPROVER_ROLE();

    await multiSig.grantRole(ADMIN_ROLE, adminAddress);
    await multiSig.grantRole(MINTER_ROLE, minterAddress);
    await multiSig.grantRole(BURNER_ROLE, burnerAddress);
    await multiSig.grantRole(APPROVER_ROLE, approverAddress);
  });

  describe("Initialization", function () {
    it("Should initialize with correct token contract", async function () {
      expect(await multiSig.gsdcToken()).to.equal(gsdc.address);
    });

    it("Should set correct cooldown period", async function () {
      expect(await multiSig.COOLDOWN_PERIOD()).to.equal(COOLDOWN_PERIOD);
    });

    it("Should grant initial roles to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await multiSig.DEFAULT_ADMIN_ROLE();
      const ADMIN_ROLE = await multiSig.ADMIN_ROLE();
      
      expect(await multiSig.hasRole(DEFAULT_ADMIN_ROLE, ownerAddress)).to.be.true;
      expect(await multiSig.hasRole(ADMIN_ROLE, ownerAddress)).to.be.true;
    });
  });

  describe("Token Minting", function () {
    it("Should queue mint transaction with cooldown", async function () {
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      expect(event).to.not.be.undefined;
      
      const txId = event?.args?.txId;
      const pendingTx = await multiSig.getPendingTransaction(txId);
      
      expect(pendingTx.target).to.equal(userAddress);
      expect(pendingTx.amount).to.equal(MINT_AMOUNT);
      expect(pendingTx.txType).to.equal(0); // TransactionType.MINT
      expect(pendingTx.status).to.equal(0); // TransactionStatus.PENDING
    });

    it("Should not allow non-minter to queue mint", async function () {
      await expect(multiSig.connect(user).mintTokens(userAddress, MINT_AMOUNT))
        .to.be.reverted;
    });

    it("Should not allow minting to zero address", async function () {
      await expect(multiSig.connect(minter).mintTokens(ethers.constants.AddressZero, MINT_AMOUNT))
        .to.be.revertedWith("Mint to the zero address");
    });

    it("Should execute mint after cooldown period", async function () {
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      // Fast forward time past cooldown
      await time.increase(COOLDOWN_PERIOD + 1);

      await expect(multiSig.executeTransaction(txId))
        .to.emit(multiSig, "TransactionExecuted")
        .withArgs(txId, true); // auto-executed

      expect(await gsdc.balanceOf(userAddress)).to.equal(MINT_AMOUNT);
    });

    it("Should allow approver to approve and execute immediately", async function () {
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      await expect(multiSig.connect(approver).approveTransaction(txId))
        .to.emit(multiSig, "TransactionApproved")
        .withArgs(txId, approverAddress);

      expect(await gsdc.balanceOf(userAddress)).to.equal(MINT_AMOUNT);
    });
  });

  describe("Token Burning", function () {
    beforeEach(async function () {
      // First mint tokens to user
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;
      
      await multiSig.connect(approver).approveTransaction(txId);
    });

    it("Should queue burn transaction", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      const tx = await multiSig.connect(burner).burnTokens(userAddress, burnAmount);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      expect(event).to.not.be.undefined;
      
      const txId = event?.args?.txId;
      const pendingTx = await multiSig.getPendingTransaction(txId);
      
      expect(pendingTx.target).to.equal(userAddress);
      expect(pendingTx.amount).to.equal(burnAmount);
      expect(pendingTx.txType).to.equal(1); // TransactionType.BURN
    });

    it("Should execute burn after approval", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      const tx = await multiSig.connect(burner).burnTokens(userAddress, burnAmount);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      // User must approve the burn first
      await gsdc.connect(user).approve(multiSig.address, burnAmount);
      
      await multiSig.connect(approver).approveTransaction(txId);

      expect(await gsdc.balanceOf(userAddress)).to.equal(MINT_AMOUNT.sub(burnAmount));
    });

    it("Should not allow non-burner to queue burn", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      await expect(multiSig.connect(user).burnTokens(userAddress, burnAmount))
        .to.be.reverted;
    });
  });

  describe("Blacklisted Token Burning", function () {
    beforeEach(async function () {
      // Mint tokens and then blacklist the user
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;
      
      await multiSig.connect(approver).approveTransaction(txId);
      
      // Blacklist the user
      const blacklistTx = await multiSig.connect(admin).setBlacklistStatus(userAddress, true);
      const blacklistReceipt = await blacklistTx.wait();
      const blacklistEvent = blacklistReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const blacklistTxId = blacklistEvent?.args?.txId;
      
      await multiSig.connect(approver).approveTransaction(blacklistTxId);
    });

    it("Should allow burning from blacklisted address", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      const tx = await multiSig.connect(burner).burnBlacklistedTokens(userAddress, burnAmount);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      await multiSig.connect(approver).approveTransaction(txId);

      expect(await gsdc.balanceOf(userAddress)).to.equal(MINT_AMOUNT.sub(burnAmount));
    });

    it("Should allow admin to burn blacklisted tokens", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      const tx = await multiSig.connect(admin).burnBlacklistedTokens(userAddress, burnAmount);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      await multiSig.connect(approver).approveTransaction(txId);

      expect(await gsdc.balanceOf(userAddress)).to.equal(MINT_AMOUNT.sub(burnAmount));
    });
  });

  describe("Blacklist Management", function () {
    it("Should queue blacklist operation", async function () {
      const BLACKLIST_MANAGER_ROLE = await multiSig.BLACKLIST_MANAGER_ROLE();
      await multiSig.grantRole(BLACKLIST_MANAGER_ROLE, adminAddress);
      
      const tx = await multiSig.connect(admin).setBlacklistStatus(userAddress, true);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      expect(event).to.not.be.undefined;
      
      const txId = event?.args?.txId;
      const pendingTx = await multiSig.getPendingTransaction(txId);
      
      expect(pendingTx.target).to.equal(userAddress);
      expect(pendingTx.txType).to.equal(3); // TransactionType.BLACKLIST
    });

    it("Should execute blacklist after approval", async function () {
      const BLACKLIST_MANAGER_ROLE = await multiSig.BLACKLIST_MANAGER_ROLE();
      await multiSig.grantRole(BLACKLIST_MANAGER_ROLE, adminAddress);
      
      const tx = await multiSig.connect(admin).setBlacklistStatus(userAddress, true);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      await multiSig.connect(approver).approveTransaction(txId);

      expect(await multiSig.isBlacklisted(userAddress)).to.be.true;
    });

    it("Should not allow blacklisting admin", async function () {
      const BLACKLIST_MANAGER_ROLE = await multiSig.BLACKLIST_MANAGER_ROLE();
      await multiSig.grantRole(BLACKLIST_MANAGER_ROLE, adminAddress);
      
      await expect(multiSig.connect(admin).setBlacklistStatus(adminAddress, true))
        .to.be.revertedWith("Cannot blacklist admin");
    });
  });

  describe("Freeze Management", function () {
    it("Should queue freeze operation", async function () {
      const FREEZE_MANAGER_ROLE = await multiSig.FREEZE_MANAGER_ROLE();
      await multiSig.grantRole(FREEZE_MANAGER_ROLE, adminAddress);
      
      const tx = await multiSig.connect(admin).freezeAddress(userAddress);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      expect(event).to.not.be.undefined;
      
      const txId = event?.args?.txId;
      const pendingTx = await multiSig.getPendingTransaction(txId);
      
      expect(pendingTx.target).to.equal(userAddress);
      expect(pendingTx.txType).to.equal(5); // TransactionType.FREEZE
    });

    it("Should execute freeze after approval", async function () {
      const FREEZE_MANAGER_ROLE = await multiSig.FREEZE_MANAGER_ROLE();
      await multiSig.grantRole(FREEZE_MANAGER_ROLE, adminAddress);
      
      const tx = await multiSig.connect(admin).freezeAddress(userAddress);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      await multiSig.connect(approver).approveTransaction(txId);

      expect(await multiSig.isFrozen(userAddress)).to.be.true;
    });

    it("Should queue unfreeze operation", async function () {
      const FREEZE_MANAGER_ROLE = await multiSig.FREEZE_MANAGER_ROLE();
      await multiSig.grantRole(FREEZE_MANAGER_ROLE, adminAddress);
      
      // First freeze the address
      const freezeTx = await multiSig.connect(admin).freezeAddress(userAddress);
      const freezeReceipt = await freezeTx.wait();
      const freezeEvent = freezeReceipt.events?.find((e: any) => e.event === "TransactionQueued");
      const freezeTxId = freezeEvent?.args?.txId;
      await multiSig.connect(approver).approveTransaction(freezeTxId);
      
      // Then unfreeze
      const tx = await multiSig.connect(admin).unfreezeAddress(userAddress);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      expect(event).to.not.be.undefined;
      
      const txId = event?.args?.txId;
      const pendingTx = await multiSig.getPendingTransaction(txId);
      
      expect(pendingTx.target).to.equal(userAddress);
      expect(pendingTx.txType).to.equal(6); // TransactionType.UNFREEZE
    });
  });

  describe("Transaction Rejection", function () {
    it("Should allow approver to reject transactions", async function () {
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      const reason = "Invalid mint request";
      
      await expect(multiSig.connect(approver).rejectTransaction(txId, reason))
        .to.emit(multiSig, "TransactionRejected")
        .withArgs(txId, approverAddress, reason);

      const pendingTx = await multiSig.getPendingTransaction(txId);
      expect(pendingTx.status).to.equal(2); // TransactionStatus.REJECTED
      expect(pendingTx.rejectionReason).to.equal(reason);
    });

    it("Should require rejection reason", async function () {
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;

      await expect(multiSig.connect(approver).rejectTransaction(txId, ""))
        .to.be.revertedWith("Rejection reason required");
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow admin to emergency pause", async function () {
      await expect(multiSig.connect(admin).emergencyPause())
        .to.emit(multiSig, "Paused")
        .withArgs(adminAddress);

      expect(await multiSig.paused()).to.be.true;
    });

    it("Should allow admin to emergency unpause", async function () {
      await multiSig.connect(admin).emergencyPause();
      
      await expect(multiSig.connect(admin).emergencyUnpause())
        .to.emit(multiSig, "Unpaused")
        .withArgs(adminAddress);

      expect(await multiSig.paused()).to.be.false;
    });

    it("Should not allow operations when paused", async function () {
      await multiSig.connect(admin).emergencyPause();
      
      await expect(multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("View Functions", function () {
    it("Should return pending transaction IDs", async function () {
      const tx1 = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const tx2 = await multiSig.connect(minter).mintTokens(adminAddress, MINT_AMOUNT);
      
      const pendingIds = await multiSig.getPendingTransactionIds();
      expect(pendingIds.length).to.equal(2);
    });

    it("Should return correct blacklist status", async function () {
      expect(await multiSig.isBlacklisted(userAddress)).to.be.false;
      
      const BLACKLIST_MANAGER_ROLE = await multiSig.BLACKLIST_MANAGER_ROLE();
      await multiSig.grantRole(BLACKLIST_MANAGER_ROLE, adminAddress);
      
      const tx = await multiSig.connect(admin).setBlacklistStatus(userAddress, true);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;
      
      await multiSig.connect(approver).approveTransaction(txId);
      
      expect(await multiSig.isBlacklisted(userAddress)).to.be.true;
    });

    it("Should return correct frozen status", async function () {
      expect(await multiSig.isFrozen(userAddress)).to.be.false;
      
      const FREEZE_MANAGER_ROLE = await multiSig.FREEZE_MANAGER_ROLE();
      await multiSig.grantRole(FREEZE_MANAGER_ROLE, adminAddress);
      
      const tx = await multiSig.connect(admin).freezeAddress(userAddress);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;
      
      await multiSig.connect(approver).approveTransaction(txId);
      
      expect(await multiSig.isFrozen(userAddress)).to.be.true;
    });
  });

  describe("Role Management", function () {
    it("Should queue role grants", async function () {
      const MINTER_ROLE = await multiSig.MINTER_ROLE();
      
      const tx = await multiSig.grantRole(MINTER_ROLE, userAddress);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      expect(event).to.not.be.undefined;
      
      const txId = event?.args?.txId;
      const pendingTx = await multiSig.getPendingTransaction(txId);
      
      expect(pendingTx.target).to.equal(userAddress);
      expect(pendingTx.txType).to.equal(7); // TransactionType.ROLE_GRANT
    });

    it("Should queue role revokes", async function () {
      const MINTER_ROLE = await multiSig.MINTER_ROLE();
      
      const tx = await multiSig.revokeRole(MINTER_ROLE, minterAddress);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      expect(event).to.not.be.undefined;
      
      const txId = event?.args?.txId;
      const pendingTx = await multiSig.getPendingTransaction(txId);
      
      expect(pendingTx.target).to.equal(minterAddress);
      expect(pendingTx.txType).to.equal(8); // TransactionType.ROLE_REVOKE
    });
  });

  describe("Redemption Requests", function () {
    beforeEach(async function () {
      // Mint tokens to user first
      const tx = await multiSig.connect(minter).mintTokens(userAddress, MINT_AMOUNT);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TransactionQueued");
      const txId = event?.args?.txId;
      
      await multiSig.connect(approver).approveTransaction(txId);
    });

    it("Should allow users to request redemption", async function () {
      const redeemAmount = ethers.utils.parseEther("500");
      
      await expect(multiSig.connect(user).requestRedemption(redeemAmount))
        .to.not.be.reverted;

      const request = await multiSig.redemptionRequests(1);
      expect(request.user).to.equal(userAddress);
      expect(request.amount).to.equal(redeemAmount);
      expect(request.processed).to.be.false;
    });

    it("Should allow admin to process redemption requests", async function () {
      const redeemAmount = ethers.utils.parseEther("500");
      
      await multiSig.connect(user).requestRedemption(redeemAmount);
      
      // User must approve the burn
      await gsdc.connect(user).approve(multiSig.address, redeemAmount);
      
      await multiSig.connect(admin).processRedemption(1, true);

      const request = await multiSig.redemptionRequests(1);
      expect(request.processed).to.be.true;
      expect(request.approved).to.be.true;
    });
  });
});
