
import { ethers, upgrades, run } from "hardhat";

async function main() {
  console.log("Deploying Upgradeable GSDC to BSC Testnet...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Check if we're on BSC testnet
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);

    if (network.chainId !== 97n) {
      console.warn("Warning: Not deploying to BSC Testnet (Chain ID 97)");
    }

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

    console.log("\nContract verification:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Has DEFAULT_ADMIN_ROLE:", hasAdminRole);
    console.log("- Has SUPER_ADMIN_ROLE:", hasSuperAdminRole);
    console.log("- Has APPROVER_ROLE:", hasApproverRole);

    // Wait for a few block confirmations before verification
    console.log("\nWaiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute

    // Verify the contract on BSCScan
    if (process.env.BSCSCAN_API_KEY) {
      try {
        console.log("\nVerifying contract on BSCScan...");
        await run("verify:verify", {
          address: implementationAddress,
          constructorArguments: [],
        });
        console.log("Contract verified successfully!");
      } catch (error: any) {
        console.log("Verification failed:", error.message);
        if (error.message.includes("Already Verified")) {
          console.log("Contract was already verified");
        }
      }
    } else {
      console.log("Skipping verification: BSCSCAN_API_KEY not provided");
    }

    console.log("\nDeployment completed successfully!");
    console.log("Save these addresses for your frontend configuration:");
    console.log("- Proxy Address (use this in your frontend):", gsdcAddress);
    console.log("- Implementation Address:", implementationAddress);
    console.log("\nTo interact with the contract, always use the Proxy Address:", gsdcAddress);

  } catch (error: any) {
    console.error("Deployment failed:", error.message);
    if (error.message.includes('insufficient funds')) {
      console.error("\nTroubleshooting:");
      console.error("1. Make sure you have enough BNB for gas fees");
      console.error("2. Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
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
