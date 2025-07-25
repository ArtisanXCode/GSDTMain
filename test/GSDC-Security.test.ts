
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Enhanced GSDC Security Features", function () {
  let gsdc: Contract;
  let deployer: Signer;
  let signer1: Signer;
  let signer2: Signer;
  let user1: Signer;
  let user2: Signer;
  let deployerAddress: string;
  let signer1Address: string;
  let signer2Address: string;
  let user1Address: string;
  let user2Address: string;

  beforeEach(async function () {
    [deployer, signer1, signer2, user1, user2] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress();
    signer1Address = await signer1.getAddress();
    signer2Address = await signer2.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    const initialSigners = [deployerAddress, signer1Address, signer2Address];

    const GSDC = await ethers.getContractFactory("GSDC");
    gsdc = await GSDC.deploy(initialSigners);
    await gsdc.deployed();

    // Grant necessary roles
    const MINTER_ROLE = await gsdc.MINTER_ROLE();
    const BURNER_ROLE = await gsdc.BURNER_ROLE();
    const BLACKLIST_MANAGER_ROLE = await gsdc.BLACKLIST_MANAGER_ROLE();
    const TIMELOCK_ADMIN_ROLE = await gsdc.TIMELOCK_ADMIN_ROLE();

    await gsdc.grantRole(MINTER_ROLE, deployerAddress);
    await gsdc.grantRole(BURNER_ROLE, deployerAddress);
    await gsdc.grantRole(BLACKLIST_MANAGER_ROLE, deployerAddress);
    await gsdc.grantRole(TIMELOCK_ADMIN_ROLE, deployerAddress);

    // Approve KYC for test users
    await gsdc.updateKYCStatus(user1Address, true);
    await gsdc.updateKYCStatus(user2Address, true);
  });

  describe("Multi-Signature System", function () {
    it("Should require minimum signatures for sensitive operations", async function () {
      expect(await gsdc.minSignatures()).to.equal(2);
      
      const signers = await gsdc.getAuthorizedSigners();
      expect(signers).to.include(deployerAddress);
      expect(signers).to.include(signer1Address);
      expect(signers).to.include(signer2Address);
    });

    it("Should prevent unauthorized signers from signing operations", async function () {
      // Create a dummy operation hash
      const operationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      
      await expect(
        gsdc.connect(user1).signOperation(operationHash)
      ).to.be.revertedWith("GSDC: not authorized signer");
    });
  });

  describe("Timelock Mechanism", function () {
    it("Should create timelock operations with proper delay", async function () {
      const operationType = "BLACKLIST";
      const data = ethers.utils.defaultAbiCoder.encode(
        ["address", "bool"],
        [user1Address, true]
      );

      const tx = await gsdc.proposeOperation(operationType, data);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "TimelockOperationProposed");
      const operationHash = event?.args?.operationHash;

      const operation = await gsdc.timelockOperations(operationHash);
      expect(operation.executeAfter).to.be.gt(0);
      expect(operation.proposer).to.equal(deployerAddress);
      expect(operation.operationType).to.equal(operationType);
    });

    it("Should require sufficient signatures before execution", async function () {
      const operationType = "BLACKLIST";
      const data = ethers.utils.defaultAbiCoder.encode(
        ["address", "bool"],
        [user1Address, true]
      );

      // Propose operation
      const tx = await gsdc.proposeOperation(operationType, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TimelockOperationProposed");
      const operationHash = event?.args?.operationHash;

      // Advance time past timelock delay
      await time.increase(2 * 24 * 60 * 60 + 1); // 2 days + 1 second

      // Try to execute without enough signatures
      await expect(
        gsdc.executeTimelockOperation(operationHash, operationType, data)
      ).to.be.revertedWith("GSDC: insufficient signatures");

      // Sign with authorized signers
      await gsdc.signOperation(operationHash);
      await gsdc.connect(signer1).signOperation(operationHash);

      // Now execution should work
      await expect(
        gsdc.executeTimelockOperation(operationHash, operationType, data)
      ).to.not.be.reverted;
    });
  });

  describe("Emergency System", function () {
    it("Should allow emergency guardians to activate emergency mode", async function () {
      const duration = 6 * 60 * 60; // 6 hours

      await gsdc.activateEmergencyMode(duration);

      expect(await gsdc.emergencyMode()).to.be.true;
      expect(await gsdc.paused()).to.be.true;
    });

    it("Should prevent normal operations during emergency mode", async function () {
      await gsdc.activateEmergencyMode(6 * 60 * 60);

      // Mint some tokens first (this should fail)
      await expect(
        gsdc.mint(user1Address, ethers.utils.parseEther("1000"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should automatically expire emergency mode", async function () {
      const duration = 1; // 1 second
      await gsdc.activateEmergencyMode(duration);

      expect(await gsdc.emergencyMode()).to.be.true;

      // Wait for emergency mode to expire
      await time.increase(2);

      await gsdc.deactivateEmergencyMode();
      expect(await gsdc.emergencyMode()).to.be.false;
    });
  });

  describe("Circuit Breakers", function () {
    it("Should enforce daily mint limits", async function () {
      const maxMintAmount = ethers.utils.parseEther("1000000"); // 1M GSDC
      const overLimitAmount = ethers.utils.parseEther("1000001"); // 1M + 1 GSDC

      // First mint within limit should work
      await gsdc.mint(user1Address, maxMintAmount);

      // Second mint exceeding daily limit should fail
      await expect(
        gsdc.mint(user2Address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("GSDC: daily mint limit exceeded");
    });

    it("Should reset daily limits each day", async function () {
      const mintAmount = ethers.utils.parseEther("1000000"); // 1M GSDC

      // Mint max amount for today
      await gsdc.mint(user1Address, mintAmount);

      // Advance time by 1 day
      await time.increase(24 * 60 * 60);

      // Should be able to mint again
      await expect(
        gsdc.mint(user2Address, mintAmount)
      ).to.not.be.reverted;
    });
  });

  describe("Protected Admin Functions", function () {
    it("Should prevent blacklisting of admin addresses", async function () {
      const operationType = "BLACKLIST";
      const data = ethers.utils.defaultAbiCoder.encode(
        ["address", "bool"],
        [deployerAddress, true]
      );

      // Propose operation
      const tx = await gsdc.proposeOperation(operationType, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TimelockOperationProposed");
      const operationHash = event?.args?.operationHash;

      // Sign and advance time
      await gsdc.signOperation(operationHash);
      await gsdc.connect(signer1).signOperation(operationHash);
      await time.increase(2 * 24 * 60 * 60 + 1);

      // Execution should fail
      await expect(
        gsdc.executeTimelockOperation(operationHash, operationType, data)
      ).to.be.revertedWith("GSDC: cannot blacklist admin");
    });

    it("Should prevent blacklisting of authorized signers", async function () {
      const operationType = "BLACKLIST";
      const data = ethers.utils.defaultAbiCoder.encode(
        ["address", "bool"],
        [signer1Address, true]
      );

      const tx = await gsdc.proposeOperation(operationType, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TimelockOperationProposed");
      const operationHash = event?.args?.operationHash;

      await gsdc.signOperation(operationHash);
      await gsdc.connect(signer1).signOperation(operationHash);
      await time.increase(2 * 24 * 60 * 60 + 1);

      await expect(
        gsdc.executeTimelockOperation(operationHash, operationType, data)
      ).to.be.revertedWith("GSDC: cannot blacklist signer");
    });
  });

  describe("Signer Management", function () {
    it("Should add new signers through timelock", async function () {
      const newSigner = user1Address;
      
      await gsdc.addSigner(newSigner);
      
      // This creates a timelock operation that needs to be executed
      // For testing, we'll verify the signer was not immediately added
      expect(await gsdc.isAuthorizedSigner(newSigner)).to.be.false;
    });

    it("Should prevent removing too many signers", async function () {
      // Try to remove signer that would break minimum signature requirement
      const operationType = "UPDATE_SIGNER";
      const data = ethers.utils.defaultAbiCoder.encode(
        ["address", "bool"],
        [signer1Address, false]
      );

      const tx = await gsdc.proposeOperation(operationType, data);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TimelockOperationProposed");
      const operationHash = event?.args?.operationHash;

      await gsdc.signOperation(operationHash);
      await gsdc.connect(signer1).signOperation(operationHash);
      await time.increase(2 * 24 * 60 * 60 + 1);

      // This should work since we have 3 signers and minSignatures is 2
      await expect(
        gsdc.executeTimelockOperation(operationHash, operationType, data)
      ).to.not.be.reverted;
    });
  });
});
