import expect from "chai";

/**
 * Structure
 * 
 * 0:        A
 *          / \
 * 1:      B   C
 *        / \
 * 2:    D   E
 *      / \
 * 3:  F   G
 */

describe("HRS", function() {

  let deployer, A, B, C, D, E, F, G;
  let principal;
  let superiorToInferiors, inferiorToSuperior, agentLevels;
  let contractFactory;
  let contract;

  before("setup the factory", async function() {
    [deployer, A, B, C, D, E, F, G] = (await ethers.getSigners()).map(({ address }) => address);
    principal = (await ethers.getSigners())[1];

    superiorToInferiors = [
      [ A, [B, C] ],
      [ B, [D, E] ],
      [ D, [F, G] ],
    ];
    inferiorToSuperior = [
      [ B, A ],
      [ C, A ],
      [ D, B ],
      [ E, B ],
      [ F, D ],
      [ G, D ],
    ];
    agentLevels = [
      [ A, 0 ],
      [ B, 1 ],
      [ C, 1 ],
      [ D, 2 ],
      [ E, 2 ],
      [ F, 3 ],
      [ G, 3 ],
    ];
        
    contractFactory = await ethers.getContractFactory("HRSTest");
  });

  beforeEach("setup the contract", async function() {
    contract = await contractFactory.deploy(superiorToInferiors, inferiorToSuperior, agentLevels, principal.address);
    await contract.deployed();
  });

  it("deployer of the contract should be its owner", async function() {
    const contractOwner = await contract.getOwner();

    expect(contractOwner).to.equal(deployer);
  });

  it("should build a hierarchy structure", async function() {
    const pairs = [
      [ contract.getSuperiorOf(B), A ],
      [ contract.getSuperiorOf(C), A ],
      [ contract.getSuperiorOf(D), B ],
      [ contract.getSuperiorOf(E), B ],
      [ contract.getSuperiorOf(F), D ],
      [ contract.getSuperiorOf(G), D ],
    ];
    const [promisesSuperior, expected] = transpose(pairs);
    const fetched = await Promise.all(promisesSuperior);
    expect(fetched).to.have.ordered.members(expected);

    const promisesInferior = [
      contract.getInferiorsOf(A),
      contract.getInferiorsOf(B),
      contract.getInferiorsOf(D),
    ];
    const [inferiorsA, inferiorsB, inferiorsC] = await Promise.all(promisesInferior);
    expect(inferiorsA).to.have.members([B, C]);
    expect(inferiorsB).to.have.members([D, E]);
    expect(inferiorsC).to.have.members([F, G]);
  });

  it("should assign agents their coresponding levels", async function() {
    const pairs = [
      [ contract.getLevelOf(A), 0 ],
      [ contract.getLevelOf(B), 1 ],
      [ contract.getLevelOf(C), 1 ],
      [ contract.getLevelOf(D), 2 ],
      [ contract.getLevelOf(E), 2 ],
      [ contract.getLevelOf(F), 3 ],
      [ contract.getLevelOf(G), 3 ],
    ];
    const [promises, expected] = transpose(pairs);
    const fetched = await Promise.all(promises);
    expect(fetched).to.have.ordered.members(expected);
  });

  it("should correctly reassign relationships and levels on promotion", async function() {
    await contract.connect(principal).promote(D, 1, A);

    expect(await contract.getLevelOf(D)).to.be.equal(1);
    // TODO: test new superior, new superior's inferiors, old superior's inferiors, emitted event
  });

  it("should go up the hierarchy and award each superior a fraction of the inferior's", async function() {
    await contract.reward(F, 1000);
    // F gets 1000
    // D gets 200
    // B gets 40
    // A gets 8
    // uncomment console.log HRS.sol:128 for example
  });
});

function transpose (a) {
  return a[0].map((_, c) => a.map(r => r[c]));
}
