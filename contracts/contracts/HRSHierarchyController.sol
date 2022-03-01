// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./HRSRewardController.sol";

struct AgentLevelDTO {
    address agentAddress;
    uint8 level;
}

struct SuperiorToInferiorsDTO {
    address superior;
    address[] inferiors;
}

struct InferiorToSuperiorDTO {
    address inferior;
    address superior;
}

contract HRSHierarchyController is HRSRewardController {
    
    event onPromote(address agent, uint8 newLevel, address newSuperior);
    // event onRelationshipChanged / onPromotion

    mapping(address => address) inferiorToSuperior;
    mapping(address => address[]) superiorToInferiors;

    mapping(address => uint8) agentToLevel;
    mapping(address => uint24) agentToPoints;

    constructor(
        SuperiorToInferiorsDTO[] memory _superiorToInferiors,
        InferiorToSuperiorDTO[] memory _inferiorToSuperior,
        AgentLevelDTO[] memory _agentLevels,
        address _principal
    ) HRSRewardController(_principal) {
        initHierarchy(_superiorToInferiors, _inferiorToSuperior);
        initAgentLevels(_agentLevels);
    }

    function initHierarchy(
        SuperiorToInferiorsDTO[] memory _superiorToInferiors,
        InferiorToSuperiorDTO[] memory _inferiorToSuperior
    ) internal {
        // populate superiorToInferiors mapping
        for (uint i; i < _superiorToInferiors.length; i++) {
            address[] memory inferiors = _superiorToInferiors[i].inferiors;
            superiorToInferiors[_superiorToInferiors[i].superior] = inferiors;
        }

        // populate inferiorToSuperior mapping
        for (uint i; i < _inferiorToSuperior.length; i++) {
            address inferior = _inferiorToSuperior[i].inferior;
            address superior = _inferiorToSuperior[i].superior;
            inferiorToSuperior[inferior] = superior;
        }
    }

    function initAgentLevels(
        AgentLevelDTO[] memory _agentLevels
    ) internal {
        for (uint i = 0; i < _agentLevels.length; i++) {
            address agentAddress = _agentLevels[i].agentAddress;
            uint8 level = _agentLevels[i].level;
            agentToLevel[agentAddress] = level;
        }
    }

    function promote(address _agent, uint8 _newLevel, address _newSuperior) external onlyRole(PRINCIPAL_ROLE) {
        // remove agent from inferiors of old superior
        // TODO: simplify
        address oldSuperior = inferiorToSuperior[_agent];
        address[] memory oldInferiors = superiorToInferiors[oldSuperior];
        address[] memory newInferiors = new address[](oldInferiors.length - 1);
        uint count = 0;
        for (uint i = 0; i < oldInferiors.length; i++) {
            if (oldInferiors[i] != _agent) {
                newInferiors[count] = oldInferiors[i];
                count++;
            }
        }
        superiorToInferiors[oldSuperior] = newInferiors;

        // set new superior
        inferiorToSuperior[_agent] = _newSuperior;

        // add agent as inferior to new superior
        superiorToInferiors[_newSuperior].push(_agent);

        // update the agent's level
        agentToLevel[_agent] = _newLevel;

        emit onPromote(_agent, _newLevel, _newSuperior);
    }

    // temp? helpers
    function getSuperiorOf(address _inferior) external view returns (address) {
        return inferiorToSuperior[_inferior];
    }

    function getInferiorsOf(address _superior) external view returns (address[] memory) {
        return superiorToInferiors[_superior];
    }

    function getLevelOf(address _agent) external view returns (uint8) {
        return agentToLevel[_agent];
    }

    function getPointsOf(address _agent) external view returns (uint24) {
        return agentToPoints[_agent];
    }
}
