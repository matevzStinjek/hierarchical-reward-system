import { ContractFactory } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { solidity } from "ethereum-waffle";
import { without } from "lodash";
import { HRSTest } from "../typechain/HRSTest";
import chai from "chai";
import * as hardhat from "hardhat";

chai.use(solidity);
const { expect } = chai;

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

describe("HRS", () => {

  let [deployer, A, B, C, D, E, F, G]: string[] = [];
  let principal: SignerWithAddress;
  let [superiorToInferiors, inferiorToSuperior, agentLevels]: any[][] = [];
  let contractFactory: ContractFactory;
  let contract: HRSTest;

  before("setup the factory", async () => {
    const signers = await hardhat.ethers.getSigners();
    [deployer, A, B, C, D, E, F, G] = signers.map(({ address }) => address);
    principal = signers[1];

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
        
    contractFactory = await hardhat.ethers.getContractFactory("HRSTest");
  });

  beforeEach("setup the contract", async () => {
    contract = (await contractFactory.deploy(superiorToInferiors, inferiorToSuperior, agentLevels, principal.address) as HRSTest);
    await contract.deployed();
  });

  it("deployer of the contract should be its owner", async () => {
    const contractOwner = await contract.getOwner();

    expect(contractOwner).to.equal(deployer);
  });

  it("should build a hierarchy structure", async () => {
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

  it("should assign agents their coresponding levels", async () => {
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

  it("should correctly reassign relationships and levels on promotion", async () => {
    const _newLevel = 1;
    const _promotedAgent = D;
    const _newSuperior = A;
    const _oldSuperior = await contract.getSuperiorOf(_promotedAgent);
    const _newSuperiorOldInferiors = await contract.getInferiorsOf(_newSuperior);
    const _oldSuperiorOldsInferiors = await contract.getInferiorsOf(_oldSuperior);

    const promote = contract.connect(principal).promote(_promotedAgent, _newLevel, _newSuperior);

    expect(promote).to.emit(contract, "onPromote").withArgs(_promotedAgent, _newLevel, _newSuperior);

    await promote;
    contract.getLevelOf(_promotedAgent)
      .then(newLevel => expect(newLevel).to.be.equal(_newLevel));
    
    contract.getSuperiorOf(_promotedAgent)
      .then(newSuperior => expect(newSuperior).to.be.equal(_newSuperior));

    contract.getInferiorsOf(_newSuperior)
      .then(newSuperiorInferiors => expect(newSuperiorInferiors).to.have.all.members([..._newSuperiorOldInferiors, _promotedAgent]));
    
    contract.getInferiorsOf(_oldSuperior)
      .then(oldSuperiorInferiors => expect(oldSuperiorInferiors).to.have.all.members(without(_oldSuperiorOldsInferiors, _promotedAgent)));
  });

  it("should go up the hierarchy and award each superior a fraction of the inferior's", async () => {
    await contract.reward(F, 1000);

    const expectedPoints = [
      [ contract.getPointsOf(F), 1000 ],
      [ contract.getPointsOf(D),  200 ],
      [ contract.getPointsOf(B),   40 ],
      [ contract.getPointsOf(A),    8 ],
    ];

    const [promises, expected] = transpose(expectedPoints);
    const points = await Promise.all(promises);
    expect(points).to.have.ordered.members(expected);
  });
});

function transpose (a: any) {
  return a[0].map((_: any, c: any) => a.map((r: any) => r[c]));
}
