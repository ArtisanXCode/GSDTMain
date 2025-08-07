
import { ethers, run } from "hardhat";

async function main() {
  console.log("Step 1: Deploying GSDC Implementation Contract...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);

    if (network.chainId !== 97n) {
      console.warn("Warning: Not deploying to BSC Testnet (Chain ID 97)");
    }

    // Step 1: Deploy GSDC Implementation Contract
    console.log("\n📄 Deploying GSDC Implementation...");
    const GSDC = await ethers.getContractFactory("GSDC");
    const gsdcImplementation = await GSDC.deploy();
    await gsdcImplementation.waitForDeployment();
    
    const implementationAddress = await gsdcImplementation.getAddress();
    console.log("✅ GSDC Implementation deployed to:", implementationAddress);

    // Step 2: Prepare initialization data
    console.log("\n🔧 Preparing initialization data...");
    const initializeData = gsdcImplementation.interface.encodeFunctionData("initialize", []);
    console.log("Initialization data prepared");

    // Step 3: Deploy Proxy Contract
    console.log("\n🔗 Deploying GSDC Proxy...");
    const GSDCProxy = await ethers.getContractFactory("GSDCProxy");
    const gsdcProxy = await GSDCProxy.deploy(implementationAddress, initializeData);
    await gsdcProxy.waitForDeployment();
    
    const proxyAddress = await gsdcProxy.getAddress();
    console.log("✅ GSDC Proxy deployed to:", proxyAddress);

    // Step 4: Verify the proxy setup
    console.log("\n🧪 Verifying proxy setup...");
    const gsdcContract = GSDC.attach(proxyAddress);
    
    const name = await gsdcContract.name();
    const symbol = await gsdcContract.symbol();
    const hasAdminRole = await gsdcContract.hasRole(await gsdcContract.DEFAULT_ADMIN_ROLE(), deployer.address);
    const hasSuperAdminRole = await gsdcContract.hasRole(await gsdcContract.SUPER_ADMIN_ROLE(), deployer.address);

    console.log("\n✅ Contract verification:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Has DEFAULT_ADMIN_ROLE:", hasAdminRole);
    console.log("- Has SUPER_ADMIN_ROLE:", hasSuperAdminRole);

    // Step 5: Wait for confirmations before verification
    console.log("\n⏳ Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute

    // Step 6: Verify contracts on BSCScan
    if (process.env.BSCSCAN_API_KEY) {
      try {
        console.log("\n🔍 Verifying Implementation on BSCScan...");
        await run("verify:verify", {
          address: implementationAddress,
          constructorArguments: [],
        });
        console.log("✅ Implementation verified successfully!");

        console.log("\n🔍 Verifying Proxy on BSCScan...");
        await run("verify:verify", {
          address: proxyAddress,
          constructorArguments: [implementationAddress, initializeData],
        });
        console.log("✅ Proxy verified successfully!");

      } catch (error: any) {
        console.log("❌ Verification failed:", error.message);
        if (error.message.includes("Already Verified")) {
          console.log("ℹ️ Contracts were already verified");
        }
      }
    } else {
      console.log("⚠️ Skipping verification: BSCSCAN_API_KEY not provided");
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("┌─────────────────────────────────────────────────┐");
    console.log("│                DEPLOYMENT SUMMARY               │");
    console.log("├─────────────────────────────────────────────────┤");
    console.log(`│ Implementation: ${implementationAddress} │`);
    console.log(`│ Proxy:          ${proxyAddress} │`);
    console.log("└─────────────────────────────────────────────────┘");
    console.log("\n🔥 IMPORTANT:");
    console.log("• Use the PROXY address in your frontend:", proxyAddress);
    console.log("• The proxy address never changes during upgrades");
    console.log("• Implementation address will change with each upgrade");

    return {
      implementation: implementationAddress,
      proxy: proxyAddress
    };

  } catch (error: any) {
    console.error("❌ Deployment failed:", error.message);
    if (error.message.includes('insufficient funds')) {
      console.error("\n💡 Troubleshooting:");
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
