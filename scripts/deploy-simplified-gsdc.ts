import { ethers, run } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log("Deploying Simplified GSDC Architecture...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);

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

    // Step 3: Deploy Proxy Contract
    console.log("\n🔗 Deploying GSDC Proxy...");
    const GSDCProxy = await ethers.getContractFactory("GSDCProxy");
    const gsdcProxy = await GSDCProxy.deploy(implementationAddress, initializeData);
    await gsdcProxy.waitForDeployment();

    const proxyAddress = await gsdcProxy.getAddress();
    console.log("✅ GSDC Proxy deployed to:", proxyAddress);

    // Step 4: Deploy MultiSig Administrative Contract
    console.log("\n🔐 Deploying MultiSig Administrative Contract...");
    const MultiSigAdmin = await ethers.getContractFactory("MultiSigAdministrative");
    const multiSigAdmin = await MultiSigAdmin.deploy(proxyAddress);
    await multiSigAdmin.waitForDeployment();

    const multiSigAddress = await multiSigAdmin.getAddress();
    console.log("✅ MultiSig Administrative deployed to:", multiSigAddress);

    // Step 5: Transfer GSDC ownership to MultiSig contract
    console.log("\n🔄 Transferring GSDC ownership to MultiSig...");
    const gsdcContract = GSDC.attach(proxyAddress);
    const transferTx = await gsdcContract.transferOwnership(multiSigAddress);
    await transferTx.wait();
    console.log("✅ Ownership transferred successfully");

    // Step 6: Verify the setup
    console.log("\n🧪 Verifying setup...");
    const name = await gsdcContract.name();
    const symbol = await gsdcContract.symbol();
    const owner = await gsdcContract.owner();
    const totalSupply = await gsdcContract.totalSupply();

    console.log("✅ Contract verification:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Owner:", owner);
    console.log("- Total Supply:", ethers.formatEther(totalSupply));
    console.log("- MultiSig Address:", multiSigAddress);
    console.log("- Ownership transferred:", owner === multiSigAddress);

    // Step 7: Wait for confirmations before verification
    console.log("\n⏳ Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute

    // Step 8: Verify contracts on BSCScan
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

        console.log("\n🔍 Verifying MultiSig Administrative on BSCScan...");
        await run("verify:verify", {
          address: multiSigAddress,
          constructorArguments: [proxyAddress],
        });
        console.log("✅ MultiSig Administrative verified successfully!");

      } catch (error: any) {
        console.log("❌ Verification failed:", error.message);
        if (error.message.includes("Already Verified")) {
          console.log("ℹ️ Contracts were already verified");
        }
      }
    } else {
      console.log("⚠️ Skipping verification - BSCSCAN_API_KEY not set");
    }

    // Step 9: Update frontend contract addresses
    console.log("\n📝 Updating frontend contract addresses...");
    const contractsFilePath = path.join(__dirname, "..", "..", "src", "contracts", "GSDC.ts");
    let contractsContent = fs.readFileSync(contractsFilePath, 'utf8');

    // Update GSDC address
    contractsContent = contractsContent.replace(
      /export const GSDC_ADDRESS = ".*"/,
      `export const GSDC_ADDRESS = "${proxyAddress}"`
    );

    // Update MultiSig address
    contractsContent = contractsContent.replace(
      /export const MULTISIG_ADMIN_ADDRESS = ".*"/,
      `export const MULTISIG_ADMIN_ADDRESS = "${multiSigAddress}"`
    );

    fs.writeFileSync(contractsFilePath, contractsContent);
    console.log("✅ Frontend contract addresses updated");

    console.log("\n🎉 Deployment Summary:");
    console.log("==========================================");
    console.log("GSDC Implementation:", implementationAddress);
    console.log("GSDC Proxy (Main Contract):", proxyAddress);
    console.log("MultiSig Administrative:", multiSigAddress);
    console.log("==========================================");

    console.log("\n📝 Next Steps:");
    console.log("1. Update GSDC_ADDRESS in src/contracts/GSDC.ts with:", proxyAddress);
    console.log("2. Update MULTISIG_ADMIN_ADDRESS in src/contracts/GSDC.ts with:", multiSigAddress);
    console.log("3. Generate and add MultiSig Administrative ABI to GSDC.ts");
    console.log("4. Update frontend components to use MultiSig for administrative functions");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });