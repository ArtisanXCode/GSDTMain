
import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying Upgradeable GSDC...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

    // Verify that upgrades is available
    if (!upgrades) {
      throw new Error("OpenZeppelin Hardhat Upgrades plugin not properly loaded");
    }

    // Deploy the upgradeable GSDC contract
    const GSDC = await ethers.getContractFactory("GSDC");
    
    console.log("Deploying GSDC proxy...");
    const gsdc = await upgrades.deployProxy(GSDC, [], {
      initializer: 'initialize',
      kind: 'uups'
    });

    await gsdc.waitForDeployment();
    const gsdcAddress = await gsdc.getAddress();

    console.log("GSDC Proxy deployed to:", gsdcAddress);

    // Get the implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(gsdcAddress);
    console.log("GSDC Implementation deployed to:", implementationAddress);

    // Verify initial setup
    const name = await gsdc.name();
    const symbol = await gsdc.symbol();
    const hasAdminRole = await gsdc.hasRole(await gsdc.DEFAULT_ADMIN_ROLE(), deployer.address);
    const hasSuperAdminRole = await gsdc.hasRole(await gsdc.SUPER_ADMIN_ROLE(), deployer.address);
    const hasApproverRole = await gsdc.hasRole(await gsdc.APPROVER_ROLE(), deployer.address);

    console.log("Contract verification:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Has DEFAULT_ADMIN_ROLE:", hasAdminRole);
    console.log("- Has SUPER_ADMIN_ROLE:", hasSuperAdminRole);
    console.log("- Has APPROVER_ROLE:", hasApproverRole);

    // Grant APPROVER_ROLE to additional accounts if needed
    const APPROVER_ROLE = await gsdc.APPROVER_ROLE();
    console.log("APPROVER_ROLE hash:", APPROVER_ROLE);

    console.log("\nDeployment completed successfully!");
    console.log("Save these addresses for your frontend configuration:");
    console.log("- Proxy Address:", gsdcAddress);
    console.log("- Implementation Address:", implementationAddress);

  } catch (error: any) {
    console.error("Deployment failed:", error.message);
    if (error.message.includes('deployProxy')) {
      console.error("\nTroubleshooting:");
      console.error("1. Make sure @openzeppelin/hardhat-upgrades is installed");
      console.error("2. Verify hardhat.config.ts imports the plugin correctly");
      console.error("3. Try running: npm install --save-dev @openzeppelin/hardhat-upgrades");
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
