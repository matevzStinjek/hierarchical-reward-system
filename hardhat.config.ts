import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
    ],
  },
};

export default config;
  