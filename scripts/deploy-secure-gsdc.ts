
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Enhanced GSDC with Multi-Signature Security...");

  const [deployer, signer1, signer2, signer3] = await ethers.getSigners();
  
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Initial signers for multi-signature setup
  const initialSigners = [
    deployer.address,    // Primary admin
    signer1.address,     // Secondary admin
    signer2.address      // Emergency guardian
  ];

  console.log("Initial authorized signers:", initialSigners);

  // Deploy the enhanced GSDC contract
  const GSDC = await ethers.getContractFactory("GSDC");
  const gsdc = await GSDC.deploy(initialSigners);

  await gsdc.deployed();

  console.log("Enhanced GSDC deployed to:", gsdc.address);
  console.log("Minimum signatures required:", await gsdc.minSignatures());
  console.log("Emergency mode:", await gsdc.emergencyMode());

  // Grant initial roles to authorized addresses
  const MINTER_ROLE = await gsdc.MINTER_ROLE();
  const BURNER_ROLE = await gsdc.BURNER_ROLE();
  const PAUSER_ROLE = await gsdc.PAUSER_ROLE();
  const PRICE_UPDATER_ROLE = await gsdc.PRICE_UPDATER_ROLE();
  const BLACKLIST_MANAGER_ROLE = await gsdc.BLACKLIST_MANAGER_ROLE();
  const TIMELOCK_ADMIN_ROLE = await gsdc.TIMELOCK_ADMIN_ROLE();

  console.log("Granting roles to deployer...");
  await gsdc.grantRole(MINTER_ROLE, deployer.address);
  await gsdc.grantRole(BURNER_ROLE, deployer.address);
  await gsdc.grantRole(PAUSER_ROLE, deployer.address);
  await gsdc.grantRole(PRICE_UPDATER_ROLE, deployer.address);
  await gsdc.grantRole(BLACKLIST_MANAGER_ROLE, deployer.address);
  await gsdc.grantRole(TIMELOCK_ADMIN_ROLE, deployer.address);

  console.log("Enhanced GSDC deployment completed!");
  console.log("\nSecurity Features Enabled:");
  console.log("✅ Multi-signature admin control");
  console.log("✅ Timelock mechanism (2 days delay)");
  console.log("✅ Emergency pause system");
  console.log("✅ Circuit breakers (daily limits)");
  console.log("✅ Guardian system");
  console.log("✅ Protected admin functions");

  // Verify deployment
  const authorizedSigners = await gsdc.getAuthorizedSigners();
  console.log("\nAuthorized Signers:", authorizedSigners);
  
  const [mintLimit, burnLimit, mintUsed, burnUsed] = await gsdc.getDailyLimits();
  console.log("\nDaily Limits:");
  console.log("- Mint Limit:", ethers.utils.formatEther(mintLimit), "GSDC");
  console.log("- Burn Limit:", ethers.utils.formatEther(burnLimit), "GSDC");
  console.log("- Mint Used Today:", ethers.utils.formatEther(mintUsed), "GSDC");
  console.log("- Burn Used Today:", ethers.utils.formatEther(burnUsed), "GSDC");

  return gsdc.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
