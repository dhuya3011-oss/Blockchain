const { ethers } = require("hardhat");

async function main() {
  const F = await ethers.getContractFactory("FakeProductDetector");
  const c = await F.deploy();
  await c.waitForDeployment();
  console.log("Deployed to:", await c.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
