import * as hardhat from "hardhat";

async function main() {
  const HRS = await hardhat.ethers.getContractFactory("HRS");
  const hrs = await HRS.attach("0x5fbdb2315678afecb367f032d93f642f64180aa3");

  const signers = await hardhat.ethers.getSigners();
  const [, A, , , D] = signers.map(({ address }) => address);
  const principal = signers[1];
  await hrs.connect(principal).promote(D, 1, A);

  return "Promoted D to level 1";
}

main()
  .then(message => {
    console.log(message);
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
