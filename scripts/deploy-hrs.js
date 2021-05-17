const hre = require("hardhat")


async function main() {
    const [deployer, A, B, C, D, E] = (await hre.ethers.getSigners()).map(({ address }) => address)

    const superiorToInferiors = [
        [ A, [B, C] ],
        [ B, [D, E] ],
    ]
    const inferiorToSuperior = [
        [ B, A ],
        [ C, A ],
        [ D, B ],
        [ E, B ],
    ]
    const agentLevels = [
        [ A, 0 ],
        [ B, 1 ],
        [ C, 1 ],
        [ D, 2 ],
        [ E, 2 ],
    ]

  const HRSFactory = await hre.ethers.getContractFactory("HRS")
  const hrs = await HRSFactory.deploy(superiorToInferiors, inferiorToSuperior, agentLevels)

  await hrs.deployed()

  console.log("HRS deployed to:", hrs.address);
}

main().then(() => process.exit(0)).catch(error => console.error(error) && process.exit(1));
