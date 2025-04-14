const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contract with account:', deployer.address);

  const CrowdFunding = await hre.ethers.getContractFactory('CrowdFunding');

  // Set parameters for constructor: (owner, goal in wei, deadline in days)
  const goal = hre.ethers.parseEther('1'); // 1 ETH goal
  const deadlineDays = 7;

  const contract = await CrowdFunding.deploy(deployer.address, goal, deadlineDays);
  await contract.waitForDeployment();

  console.log('CrowdFunding Contract deployed to:', contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
