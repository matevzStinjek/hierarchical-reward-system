const ethers = require("ethers")
const abi = require("../artifacts/contracts/HRS.sol/HRS.json").abi

async function main() {
    const address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

    const provider = new ethers.providers.JsonRpcProvider()
    const signer = provider.getSigner()
    const contract = new ethers.Contract(address, abi, signer)
    
    contract.on("OnTest", (from, to, amount, event) => {
        console.log({ from, to, amount, event })
    })

    const name = await contract.getOwner()
    console.log({ name })
}

main()
