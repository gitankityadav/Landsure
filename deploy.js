const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();

  await landRegistry.waitForDeployment();
  const address = await landRegistry.getAddress();

  console.log(`Contract deployed to: ${address}`);

  // Save address to file so CLI can read it
  fs.writeFileSync(
    path.join(__dirname, "../contract-address.txt"),
    address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});