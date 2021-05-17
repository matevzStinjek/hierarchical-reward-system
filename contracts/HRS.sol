// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


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

contract HRS {

    using SafeMath for uint;

    event onPromote(address agent, uint8 newLevel, address newSuperior, address[] newSuperiorInferiors, address oldSuperior, address[] oldSuperiorInferiors);
    // event onPointsReceived
    // event onPrincipalChanged
    // event onRelationshipChanged / onPromotion

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }
    modifier onlyPrincipal() {
        require(msg.sender == principal);
        _;
    }

    address private _owner;
    address private principal;

    mapping(address => address) inferiorToSuperior;
    mapping(address => address[]) superiorToInferiors;

    mapping(address => uint8) agentToLevel;

    constructor(
        SuperiorToInferiorsDTO[] memory _superiorToInferiors,
        InferiorToSuperiorDTO[] memory _inferiorToSuperior,
        AgentLevelDTO[] memory _agentLevels,
        address _principal
    ) {
        _owner = msg.sender;
        principal = _principal;
        initHierarchy(_superiorToInferiors, _inferiorToSuperior);
        initAgentLevels(_agentLevels);
    }

    function initHierarchy(
        SuperiorToInferiorsDTO[] memory _superiorToInferiors,
        InferiorToSuperiorDTO[] memory _inferiorToSuperior
    ) internal {
        // populate superiorToInferiors mapping
        for (uint i = 0; i < _superiorToInferiors.length; i++) {
            address superior = _superiorToInferiors[i].superior;
            address[] memory inferiors = _superiorToInferiors[i].inferiors;
            superiorToInferiors[superior] = inferiors;
        }

        // populate inferiorToSuperior mapping
        for (uint i = 0; i < _inferiorToSuperior.length; i++) {
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

    function getOwner() external view returns (address) {
        return _owner;
    }

    // TODO: set/get principal

    // TODO: add to hierarchy

    function promote(address _agent, uint8 _newLevel, address _newSuperior) external onlyPrincipal {
        // remove agent from inferiors of old superior
        // TODO: try to simplify
        address oldSuperior = inferiorToSuperior[_agent];
        address[] memory oldInferiors = superiorToInferiors[oldSuperior];
        address[] memory newInferiors = new address[](oldInferiors.length - 1);
        uint count = 0;
        for (uint i = 0; i < oldInferiors.length - 1; i++) {
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

        address[] memory newSuperiorInferiors = superiorToInferiors[_newSuperior];
        emit onPromote(_agent, _newLevel, _newSuperior, newSuperiorInferiors, oldSuperior, newInferiors);
    }

    function reward(address _agent, uint amount) public {
        // payable(address).send(...)
        // console.log(_agent, "gets", amount);
        address superior = inferiorToSuperior[_agent];
        bool isSuperiorSet = superior != address(0);
        if (isSuperiorSet) {
            reward(superior, amount / 10 * 2); // simplified example
        }
    }
}

contract HRSTest is HRS {

    constructor (
        SuperiorToInferiorsDTO[] memory _superiorToInferiors,
        InferiorToSuperiorDTO[] memory _inferiorToSuperior,
        AgentLevelDTO[] memory _agentLevels,
        address _principal
    ) HRS(_superiorToInferiors, _inferiorToSuperior, _agentLevels, _principal) {}

    function getSuperiorOf(address inferior) external view returns (address) {
        return inferiorToSuperior[inferior];
    }

    function getInferiorsOf(address superior) external view returns (address[] memory) {
        return superiorToInferiors[superior];
    }

    function getLevelOf(address agent) external view returns (uint8) {
        return agentToLevel[agent];
    }
}
