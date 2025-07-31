import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const GSDC = await ethers.getContractFactory("GSDC");
  const gsdc = await GSDC.deploy();
  await gsdc.deployed();

  console.log("DBDK deployed to:", gsdc.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
