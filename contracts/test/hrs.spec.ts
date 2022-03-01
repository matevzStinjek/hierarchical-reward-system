import { ContractFactory } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { solidity } from "ethereum-waffle";
import { without } from "lodash";
import { Controller } from "../typechain/Controller";
import chai from "chai";
import * as hardhat from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(solidity);
const { expect } = chai;

/**
 * Initial Structure
 * 
 * 1:        A
 *          / \
 * 2:      B   C
 *        / \
 * 3:    D   E
 *      / \
 * 4:  F   G
 */

describe("Controller", () => {

  let [deployer, A, B, C, D, E, F, G]: string[] = [];
  let [principal, client]: SignerWithAddress[] = [];
  let [superiorToInferiors, inferiorToSuperior, agentLevels]: any[][] = [];
  let contractFactory: ContractFactory;
  let contract: Controller;

  before("setup the factory", async () => {
    const signers = await hardhat.ethers.getSigners();
    [deployer, A, B, C, D, E, F, G] = signers.map(({ address }) => address);
    principal = signers[1];
    client = signers[8];

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
      [ A, 1 ],
      [ B, 2 ],
      [ C, 2 ],
      [ D, 3 ],
      [ E, 3 ],
      [ F, 4 ],
      [ G, 4 ],
    ];

    contractFactory = await hardhat.ethers.getContractFactory("Controller");
  });

  beforeEach("setup the contract", async () => {
    contract = await contractFactory.deploy(superiorToInferiors, inferiorToSuperior, agentLevels, principal.address) as Controller;
    await contract.deployed();
  });

  it("should confirm A is the principal", async () => {
    const { id } = ethers.utils;
    const PRINCIPAL_ROLE = id("PRINCIPAL_ROLE");
    const isAPrincipal = await contract.hasRole(PRINCIPAL_ROLE, A);
    expect(isAPrincipal, "A is principal").to.be.true;
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

  it("should assign agents their corresponding levels", async () => {
    const pairs = [
      [ contract.agentToLevel(A), 1 ],
      [ contract.agentToLevel(B), 2 ],
      [ contract.agentToLevel(C), 2 ],
      [ contract.agentToLevel(D), 3 ],
      [ contract.agentToLevel(E), 3 ],
      [ contract.agentToLevel(F), 4 ],
      [ contract.agentToLevel(G), 4 ],
    ];
    const [promises, expected] = transpose(pairs);
    const fetched = await Promise.all(promises);
    expect(fetched).to.have.ordered.members(expected);
  });

  it("should correctly change a level", async () => {
    const oldLevel = await contract.agentToLevel(A);
    const desiredNewLevel = oldLevel + 1;
    await contract.connect(principal).changeLevel(A, desiredNewLevel).then(tx => tx.wait())
    const newLevel = await contract.agentToLevel(A);

    expect(oldLevel).to.not.equal(newLevel);
    expect(desiredNewLevel).to.equal(newLevel);
  });

  it("should correctly reassign relationships and levels on promotion", async () => {
    const _promotedAgent = D;
    const _newSuperior = A;
    const _oldSuperior = await contract.getSuperiorOf(_promotedAgent);
    const [_newSuperiorOldInferiors, _oldSuperiorOldsInferiors] = await Promise.all([
      contract.getInferiorsOf(_newSuperior),
      contract.getInferiorsOf(_oldSuperior),
    ]);

    await contract.connect(principal).changeSuperior(_promotedAgent, _newSuperior).then((tx) => tx.wait())

    contract.getSuperiorOf(_promotedAgent)
      .then((newSuperior: string) => expect(newSuperior).to.be.equal(_newSuperior));

    contract.getInferiorsOf(_newSuperior)
      .then((newSuperiorInferiors: string[]) => expect(newSuperiorInferiors).to.have.all.members([..._newSuperiorOldInferiors, _promotedAgent]));

    contract.getInferiorsOf(_oldSuperior)
      .then((oldSuperiorInferiors: string[]) => expect(oldSuperiorInferiors).to.have.all.members(without(_oldSuperiorOldsInferiors, _promotedAgent)));
  });

  it("should register a new policy, purchase the policy subscription and have the correct token distribution", async () => {
    // register new policy
    const { formatBytes32String, parseEther } = ethers.utils;
    const name = formatBytes32String("Policy 1");
    const description = formatBytes32String("Policies description");
    const price = parseEther("1");

    await contract.connect(principal).registerNewPolicy(name, description, price).then(tx => tx.wait());

    const policy = await contract.policies(0);
    expect(policy.name).to.equal(name);
    expect(policy.description).to.equal(description);
    expect(policy.price.eq(price)).to.be.true;

    // pruchase the policy subscription
    await contract.connect(client).registerNewSubscription(0, F, { value: parseEther("2") }).then(tx => tx.wait());

    const subscription = await contract.subscriptions(client.address);
    expect(subscription.expirationDate.toNumber()).to.be.greaterThan(Math.floor(new Date().getTime() / 1000));

    // correct balances
    expect((await contract.depositsOf(F)).eq(parseEther("0.8"))).to.be.true;
    expect((await contract.depositsOf(D)).eq(parseEther("0.16"))).to.be.true;
    expect((await contract.depositsOf(B)).eq(parseEther("0.032"))).to.be.true;
    expect((await contract.depositsOf(A)).eq(parseEther("0.008"))).to.be.true;
    
    // withdraw as A
    await contract.connect(principal).withdraw().then(tx => tx.wait());
    expect((await contract.depositsOf(A)).eq(parseEther("0"))).to.be.true;
  });
});

function transpose (a: any) {
  return a[0].map((_: any, c: any) => a.map((r: any) => r[c]));
}