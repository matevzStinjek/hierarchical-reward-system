import hre from "hardhat";

async function main() {
  const signers = await hre.ethers.getSigners();
  const [, A, B, C, D, E, F, G] = signers.map(({ address }) => address);
  const principal = signers[1];

  const superiorToInferiors = [
    [ A, [B, C] ],
    [ B, [D, E] ],
    [ D, [F, G] ],
  ];
  const inferiorToSuperior = [
    [ B, A ],
    [ C, A ],
    [ D, B ],
    [ E, B ],
    [ F, D ],
    [ G, D ],
  ];
  const agentLevels = [
    [ A, 0 ],
    [ B, 1 ],
    [ C, 1 ],
    [ D, 2 ],
    [ E, 2 ],
    [ F, 3 ],
    [ G, 3 ],
  ];

  const HRSFactory = await hre.ethers.getContractFactory("HRS");
  const hrs = await HRSFactory.deploy(superiorToInferiors, inferiorToSuperior, agentLevels,  principal.address);

  await hrs.deployed();

  console.log("HRS deployed to:", hrs.address);
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
