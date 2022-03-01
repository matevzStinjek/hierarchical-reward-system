// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

import "./HRSHierarchyController.sol";

contract HRS is HRSHierarchyController {

    // event onPointsReceived

    constructor(
        SuperiorToInferiorsDTO[] calldata _superiorToInferiors,
        InferiorToSuperiorDTO[] calldata _inferiorToSuperior,
        AgentLevelDTO[] calldata _agentLevels,
        address _principal
    ) HRSHierarchyController(_superiorToInferiors, _inferiorToSuperior, _agentLevels, _principal) {}
}
