// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

import "./HRSHierarchyController.sol";

contract HRS is HRSHierarchyController {

    // event onPointsReceived
    // event onPrincipalChanged
    // event onRelationshipChanged / onPromotion

    constructor(
        SuperiorToInferiorsDTO[] memory _superiorToInferiors,
        InferiorToSuperiorDTO[] memory _inferiorToSuperior,
        AgentLevelDTO[] memory _agentLevels,
        address _principal
    ) HRSHierarchyController(_superiorToInferiors, _inferiorToSuperior, _agentLevels) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PRINCIPAL_ROLE, _principal);
    }
}
