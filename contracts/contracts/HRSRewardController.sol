// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./HRSToken.sol";
import "./HRSProductControler.sol";

contract HRSRewardController is HRSToken, HRSProductControler {

    constructor(address _principal) HRSToken() HRSProductControler(_principal) {
        initHierarchy(_superiorToInferiors, _inferiorToSuperior);
        initAgentLevels(_agentLevels);
    }
}
