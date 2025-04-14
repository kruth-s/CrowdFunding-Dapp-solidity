const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding Contract", function () {
  let CrowdFunding, contract, owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const goal = ethers.parseEther("1");
    const deadlineDays = 7;

    const Factory = await ethers.getContractFactory("CrowdFunding");
    contract = await Factory.deploy(owner.address, goal, deadlineDays);
    await contract.waitForDeployment();
  });

  it("Should set the right owner and goal", async function () {
    expect(await contract.CampaignOwner()).to.equal(owner.address);
    expect(await contract.CampaignGoal()).to.equal(ethers.parseEther("1"));
  });

  it("Should allow contributions", async () => {
    await contract.connect(addr1).funding({ value: ethers.parseEther("0.5") });
    expect(await contract.Contributions(addr1.address)).to.equal(ethers.parseEther("0.5"));
  });

  it("Should not allow funding after deadline", async () => {
    await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // Move 8 days forward
    await ethers.provider.send("evm_mine");

    await expect(
      contract.connect(addr1).funding({ value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("The Campaign deadline has passed!!!");
  });

  it("Should allow refund after deadline if goal not met", async () => {
    await contract.connect(addr1).funding({ value: ethers.parseEther("0.1") });

    await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const before = await ethers.provider.getBalance(addr1.address);
    const tx = await contract.connect(addr1).refund();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const after = await ethers.provider.getBalance(addr1.address);
    expect(after).to.be.above(before - gasUsed);
  });

  it("Should allow owner to withdraw after goal is met", async () => {
    await contract.connect(addr1).funding({ value: ethers.parseEther("0.5") });
    await contract.connect(addr2).funding({ value: ethers.parseEther("0.5") });

    const balanceBefore = await ethers.provider.getBalance(owner.address);

    const tx = await contract.connect(owner).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const balanceAfter = await ethers.provider.getBalance(owner.address);
    expect(balanceAfter).to.be.above(balanceBefore - gasUsed);
  });
});
