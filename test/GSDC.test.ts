
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("GSDC Token Contract", function () {
  let gsdc: Contract;
  let gsdcProxy: Contract;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let blacklistedUser: Signer;
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;
  let blacklistedAddress: string;

  const INITIAL_SUPPLY = ethers.utils.parseEther("0");
  const MINT_AMOUNT = ethers.utils.parseEther("1000");
  const MIN_MINT_AMOUNT = ethers.utils.parseEther("100");
  const MAX_MINT_AMOUNT = ethers.utils.parseEther("1000000");

  beforeEach(async function () {
    [owner, user1, user2, blacklistedUser] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
    blacklistedAddress = await blacklistedUser.getAddress();

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
  });

  describe("Initialization", function () {
    it("Should initialize with correct name and symbol", async function () {
      expect(await gsdc.name()).to.equal("Global South Digital Currency");
      expect(await gsdc.symbol()).to.equal("GSDC");
      expect(await gsdc.decimals()).to.equal(18);
      expect(await gsdc.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct owner", async function () {
      expect(await gsdc.owner()).to.equal(ownerAddress);
    });

    it("Should not be paused initially", async function () {
      expect(await gsdc.paused()).to.be.false;
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await expect(gsdc.mint(user1Address, MINT_AMOUNT))
        .to.emit(gsdc, "Mint")
        .withArgs(user1Address, MINT_AMOUNT);

      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT);
      expect(await gsdc.totalSupply()).to.equal(MINT_AMOUNT);
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(gsdc.connect(user1).mint(user2Address, MINT_AMOUNT))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow minting below minimum amount", async function () {
      const belowMin = ethers.utils.parseEther("50");
      await expect(gsdc.mint(user1Address, belowMin))
        .to.be.revertedWith("GSDC: Amount below minimum");
    });

    it("Should not allow minting above maximum amount", async function () {
      const aboveMax = ethers.utils.parseEther("2000000");
      await expect(gsdc.mint(user1Address, aboveMax))
        .to.be.revertedWith("GSDC: Amount above maximum");
    });

    it("Should not allow minting to zero address", async function () {
      await expect(gsdc.mint(ethers.constants.AddressZero, MINT_AMOUNT))
        .to.be.revertedWith("GSDC: Mint to the zero address");
    });

    it("Should not allow minting to blacklisted address", async function () {
      await gsdc.setBlacklistStatus(blacklistedAddress, true);
      await expect(gsdc.mint(blacklistedAddress, MINT_AMOUNT))
        .to.be.revertedWith("GSDC: Address is blacklisted");
    });

    it("Should not allow minting to frozen address", async function () {
      await gsdc.freeze(user1Address);
      await expect(gsdc.mint(user1Address, MINT_AMOUNT))
        .to.be.revertedWith("GSDC: Address is frozen");
    });

    it("Should not allow minting when paused", async function () {
      await gsdc.pause();
      await expect(gsdc.mint(user1Address, MINT_AMOUNT))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await gsdc.mint(user1Address, MINT_AMOUNT);
      await gsdc.mint(user2Address, MINT_AMOUNT);
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      await expect(gsdc.connect(user1).burn(burnAmount))
        .to.emit(gsdc, "Burn")
        .withArgs(user1Address, burnAmount);

      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT.sub(burnAmount));
      expect(await gsdc.totalSupply()).to.equal(MINT_AMOUNT.mul(2).sub(burnAmount));
    });

    it("Should not allow burning more than balance", async function () {
      const burnAmount = ethers.utils.parseEther("1500");
      await expect(gsdc.connect(user1).burn(burnAmount))
        .to.be.revertedWith("GSDC: Insufficient balance");
    });

    it("Should not allow burning from blacklisted address", async function () {
      await gsdc.setBlacklistStatus(user1Address, true);
      const burnAmount = ethers.utils.parseEther("500");
      await expect(gsdc.connect(user1).burn(burnAmount))
        .to.be.revertedWith("GSDC: Address is blacklisted");
    });

    it("Should not allow burning from frozen address", async function () {
      await gsdc.freeze(user1Address);
      const burnAmount = ethers.utils.parseEther("500");
      await expect(gsdc.connect(user1).burn(burnAmount))
        .to.be.revertedWith("GSDC: Address is frozen");
    });

    it("Should not allow burning when paused", async function () {
      await gsdc.pause();
      const burnAmount = ethers.utils.parseEther("500");
      await expect(gsdc.connect(user1).burn(burnAmount))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("BurnFrom", function () {
    beforeEach(async function () {
      await gsdc.mint(user1Address, MINT_AMOUNT);
      await gsdc.mint(user2Address, MINT_AMOUNT);
    });

    it("Should allow burning with proper allowance", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      // User1 approves user2 to burn tokens
      await gsdc.connect(user1).approve(user2Address, burnAmount);
      
      await expect(gsdc.connect(user2).burnFrom(user1Address, burnAmount))
        .to.emit(gsdc, "Burn")
        .withArgs(user1Address, burnAmount);

      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT.sub(burnAmount));
      expect(await gsdc.allowance(user1Address, user2Address)).to.equal(0);
    });

    it("Should not allow burning without sufficient allowance", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      const approveAmount = ethers.utils.parseEther("300");
      
      await gsdc.connect(user1).approve(user2Address, approveAmount);
      
      await expect(gsdc.connect(user2).burnFrom(user1Address, burnAmount))
        .to.be.revertedWith("GSDC: Insufficient allowance");
    });

    it("Should not allow burning more than balance", async function () {
      const burnAmount = ethers.utils.parseEther("1500");
      
      await gsdc.connect(user1).approve(user2Address, burnAmount);
      
      await expect(gsdc.connect(user2).burnFrom(user1Address, burnAmount))
        .to.be.revertedWith("GSDC: Insufficient balance");
    });
  });

  describe("BurnBlacklisted", function () {
    beforeEach(async function () {
      await gsdc.mint(blacklistedAddress, MINT_AMOUNT);
      await gsdc.setBlacklistStatus(blacklistedAddress, true);
    });

    it("Should allow owner to burn from blacklisted address", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      
      await expect(gsdc.burnBlacklisted(blacklistedAddress, burnAmount))
        .to.emit(gsdc, "Burn")
        .withArgs(blacklistedAddress, burnAmount);

      expect(await gsdc.balanceOf(blacklistedAddress)).to.equal(MINT_AMOUNT.sub(burnAmount));
    });

    it("Should not allow non-owner to burn from blacklisted address", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      await expect(gsdc.connect(user1).burnBlacklisted(blacklistedAddress, burnAmount))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow burning from zero address", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      await expect(gsdc.burnBlacklisted(ethers.constants.AddressZero, burnAmount))
        .to.be.revertedWith("GSDC: Burn from the zero address");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await gsdc.mint(user1Address, MINT_AMOUNT);
    });

    it("Should allow normal transfers", async function () {
      const transferAmount = ethers.utils.parseEther("500");
      
      await expect(gsdc.connect(user1).transfer(user2Address, transferAmount))
        .to.emit(gsdc, "Transfer")
        .withArgs(user1Address, user2Address, transferAmount);

      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT.sub(transferAmount));
      expect(await gsdc.balanceOf(user2Address)).to.equal(transferAmount);
    });

    it("Should not allow transfers from blacklisted sender", async function () {
      await gsdc.setBlacklistStatus(user1Address, true);
      const transferAmount = ethers.utils.parseEther("500");
      
      await expect(gsdc.connect(user1).transfer(user2Address, transferAmount))
        .to.be.revertedWith("GSDC: Address is blacklisted");
    });

    it("Should not allow transfers to blacklisted recipient", async function () {
      await gsdc.setBlacklistStatus(user2Address, true);
      const transferAmount = ethers.utils.parseEther("500");
      
      await expect(gsdc.connect(user1).transfer(user2Address, transferAmount))
        .to.be.revertedWith("GSDC: Address is blacklisted");
    });

    it("Should not allow transfers from frozen sender", async function () {
      await gsdc.freeze(user1Address);
      const transferAmount = ethers.utils.parseEther("500");
      
      await expect(gsdc.connect(user1).transfer(user2Address, transferAmount))
        .to.be.revertedWith("GSDC: Address is frozen");
    });

    it("Should not allow transfers to frozen recipient", async function () {
      await gsdc.freeze(user2Address);
      const transferAmount = ethers.utils.parseEther("500");
      
      await expect(gsdc.connect(user1).transfer(user2Address, transferAmount))
        .to.be.revertedWith("GSDC: Address is frozen");
    });
  });

  describe("Blacklist Management", function () {
    it("Should allow owner to blacklist address", async function () {
      await expect(gsdc.setBlacklistStatus(user1Address, true))
        .to.emit(gsdc, "AddressBlacklisted")
        .withArgs(user1Address, true);

      expect(await gsdc.isBlacklisted(user1Address)).to.be.true;
    });

    it("Should allow owner to unblacklist address", async function () {
      await gsdc.setBlacklistStatus(user1Address, true);
      
      await expect(gsdc.setBlacklistStatus(user1Address, false))
        .to.emit(gsdc, "AddressBlacklisted")
        .withArgs(user1Address, false);

      expect(await gsdc.isBlacklisted(user1Address)).to.be.false;
    });

    it("Should not allow blacklisting zero address", async function () {
      await expect(gsdc.setBlacklistStatus(ethers.constants.AddressZero, true))
        .to.be.revertedWith("GSDC: Cannot blacklist zero address");
    });

    it("Should not allow blacklisting owner", async function () {
      await expect(gsdc.setBlacklistStatus(ownerAddress, true))
        .to.be.revertedWith("GSDC: Cannot blacklist owner");
    });

    it("Should not allow non-owner to blacklist", async function () {
      await expect(gsdc.connect(user1).setBlacklistStatus(user2Address, true))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Freeze Management", function () {
    it("Should allow owner to freeze address", async function () {
      await expect(gsdc.freeze(user1Address))
        .to.emit(gsdc, "AddressFrozen")
        .withArgs(user1Address, true);

      expect(await gsdc.frozen(user1Address)).to.be.true;
    });

    it("Should allow owner to unfreeze address", async function () {
      await gsdc.freeze(user1Address);
      
      await expect(gsdc.unfreeze(user1Address))
        .to.emit(gsdc, "AddressFrozen")
        .withArgs(user1Address, false);

      expect(await gsdc.frozen(user1Address)).to.be.false;
    });

    it("Should not allow freezing zero address", async function () {
      await expect(gsdc.freeze(ethers.constants.AddressZero))
        .to.be.revertedWith("GSDC: Cannot freeze zero address");
    });

    it("Should not allow freezing owner", async function () {
      await expect(gsdc.freeze(ownerAddress))
        .to.be.revertedWith("GSDC: Cannot freeze owner");
    });

    it("Should not allow freezing already frozen address", async function () {
      await gsdc.freeze(user1Address);
      await expect(gsdc.freeze(user1Address))
        .to.be.revertedWith("GSDC: Address already frozen");
    });

    it("Should not allow unfreezing non-frozen address", async function () {
      await expect(gsdc.unfreeze(user1Address))
        .to.be.revertedWith("GSDC: Address not frozen");
    });

    it("Should not allow non-owner to freeze", async function () {
      await expect(gsdc.connect(user1).freeze(user2Address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause contract", async function () {
      await expect(gsdc.pause())
        .to.emit(gsdc, "Paused")
        .withArgs(ownerAddress);

      expect(await gsdc.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await gsdc.pause();
      
      await expect(gsdc.unpause())
        .to.emit(gsdc, "Unpaused")
        .withArgs(ownerAddress);

      expect(await gsdc.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(gsdc.connect(user1).pause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow minting when paused", async function () {
      await gsdc.pause();
      await expect(gsdc.mint(user1Address, MINT_AMOUNT))
        .to.be.revertedWith("Pausable: paused");
    });

    it("Should not allow transfers when paused", async function () {
      await gsdc.mint(user1Address, MINT_AMOUNT);
      await gsdc.pause();
      
      await expect(gsdc.connect(user1).transfer(user2Address, ethers.utils.parseEther("100")))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Constants", function () {
    it("Should have correct minimum mint amount", async function () {
      expect(await gsdc.MIN_MINT_AMOUNT()).to.equal(MIN_MINT_AMOUNT);
    });

    it("Should have correct maximum mint amount", async function () {
      expect(await gsdc.MAX_MINT_AMOUNT()).to.equal(MAX_MINT_AMOUNT);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple operations correctly", async function () {
      // Mint to multiple users
      await gsdc.mint(user1Address, MINT_AMOUNT);
      await gsdc.mint(user2Address, MINT_AMOUNT);
      
      // Transfer between users
      const transferAmount = ethers.utils.parseEther("200");
      await gsdc.connect(user1).transfer(user2Address, transferAmount);
      
      // Burn from user2
      const burnAmount = ethers.utils.parseEther("300");
      await gsdc.connect(user2).burn(burnAmount);
      
      expect(await gsdc.balanceOf(user1Address)).to.equal(MINT_AMOUNT.sub(transferAmount));
      expect(await gsdc.balanceOf(user2Address)).to.equal(MINT_AMOUNT.add(transferAmount).sub(burnAmount));
      expect(await gsdc.totalSupply()).to.equal(MINT_AMOUNT.mul(2).sub(burnAmount));
    });

    it("Should handle zero amount transfers", async function () {
      await gsdc.mint(user1Address, MINT_AMOUNT);
      await expect(gsdc.connect(user1).transfer(user2Address, 0))
        .to.emit(gsdc, "Transfer")
        .withArgs(user1Address, user2Address, 0);
    });
  });
});
