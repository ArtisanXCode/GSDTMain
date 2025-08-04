
import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Upgrading GSDC...");

  const [deployer] = await ethers.getSigners();
  console.log("Upgrading with account:", deployer.address);

  // Replace with your proxy address
  const PROXY_ADDRESS = process.env.GSDC_PROXY_ADDRESS || "0x742d35Cc6635C0532925a3b8D1C41Ce41C2b9AB2";
  
  console.log("Proxy address:", PROXY_ADDRESS);

  // Get the new implementation
  const GSDCV2 = await ethers.getContractFactory("GSDC");
  
  console.log("Upgrading GSDC proxy...");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, GSDCV2);
  
  console.log("GSDC upgraded");
  
  // Get the new implementation address
  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("New implementation address:", newImplementationAddress);

  // Verify the upgrade
  const name = await upgraded.name();
  const symbol = await upgraded.symbol();
  
  console.log("Upgrade verification:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Proxy address (unchanged):", PROXY_ADDRESS);
  console.log("- New implementation address:", newImplementationAddress);

  console.log("\nUpgrade completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
