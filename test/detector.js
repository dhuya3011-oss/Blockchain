const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FakeProductDetector", () => {
  let c, owner, other;
  const id = ethers.id("SERIAL-001");

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    const F = await ethers.getContractFactory("FakeProductDetector");
    c = await F.deploy();
  });

  it("registers and verifies a product", async () => {
    await c.registerProduct(id, "Shoes", 100);
    const [status, name] = await c.verifyProduct(id);
    expect(status).to.equal(1n);
    expect(name).to.equal("Shoes");
  });

  it("rejects duplicates and non-manufacturers", async () => {
    await c.registerProduct(id, "Shoes", 100);
    await expect(c.registerProduct(id, "Shoes", 100))
      .to.be.revertedWith("Already registered");
    await expect(c.connect(other).registerProduct(ethers.id("X"), "X", 1))
      .to.be.revertedWith("Not a manufacturer");
  });

  it("flags a product and reports unknown IDs as unregistered", async () => {
    await c.registerProduct(id, "Shoes", 100);
    await c.flagProduct(id);
    expect((await c.verifyProduct(id))[0]).to.equal(2n);
    expect((await c.verifyProduct(ethers.id("nope")))[0]).to.equal(0n);
  });

  it("blocks strangers from flagging products", async () => {
    await c.registerProduct(id, "Shoes", 100);
    await expect(c.connect(other).flagProduct(id))
      .to.be.revertedWith("Not authorized");
  });
});
