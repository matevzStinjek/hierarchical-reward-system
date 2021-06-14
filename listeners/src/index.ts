import { ethers } from "ethers";
import { abi } from "../../contracts/artifacts/contracts/HRS.sol/HRS.json";

async function main() {
  const address = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  const provider = new ethers.providers.JsonRpcProvider();
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
    
  contract.on("onPromote", (from, to, amount, event) => {
    console.log({ from, to, amount, event });
  });

  console.log('Listening for events...')
}

main();
