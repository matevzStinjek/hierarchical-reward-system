// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/AccessControl.sol";

// Inherits
import "./ControllerBase.sol";
import "./EscrowHolder.sol";
import "./UpgradeableBase.sol";

contract Controller is EscrowHolder, AccessControl, ControllerBase {

    /**
     * @notice Initializer function to set up the hierarchy
     */
    constructor(
        SuperiorToInferiors[] memory _superiorToInferiors,
        InferiorToSuperior[] memory _inferiorToSuperior,
        AgentLevel[] memory _agentLevels,
        address _principal
    ) {
        _setupRole(PRINCIPAL_ROLE, _principal);

        // populate superiorToInferiors mapping
        for (uint i; i < _superiorToInferiors.length; i++)
            superiorToInferiors[_superiorToInferiors[i].superior] = _superiorToInferiors[i].inferiors;


        // populate inferiorToSuperior mapping
        for (uint i; i < _inferiorToSuperior.length; i++)
            inferiorToSuperior[_inferiorToSuperior[i].inferior] = _inferiorToSuperior[i].superior;

        // Populate the levels
        for (uint i; i < _agentLevels.length; i++)
            agentToLevel[_agentLevels[i].agentAddress] = _agentLevels[i].level;

        escrow = new Escrow();
    }

    /* Functions related to bureaucracy management */
    function changeSuperior(address _agent, address _newSuperior) external onlyRole(PRINCIPAL_ROLE) {
        address oldSuperior = inferiorToSuperior[_agent];
        // Pop and swap model
        uint i;
        for (; i < superiorToInferiors[oldSuperior].length; i++)
            if (superiorToInferiors[oldSuperior][i] == _agent) 
                break;

        superiorToInferiors[oldSuperior][i] = superiorToInferiors[oldSuperior][superiorToInferiors[oldSuperior].length - 1];
        superiorToInferiors[oldSuperior].pop();

        // set new superior
        inferiorToSuperior[_agent] = _newSuperior;

        // add agent as inferior to new superior
        superiorToInferiors[_newSuperior].push(_agent);

        emit SuperiorChanged(_agent, _newSuperior);
    }

    function changeLevel(address _agent, uint8 _newLevel) external onlyRole(PRINCIPAL_ROLE) {
        // update the agent's level
        agentToLevel[_agent] = _newLevel;
        emit LevelChanged(_agent, _newLevel);
    }

    /* Functions related to policy management */
    function registerNewPolicy(bytes32 name, bytes32 description, uint256 price) external onlyRole(PRINCIPAL_ROLE) {
        // Add the new policy
        policies.push(Policy(name, description, price));

        // Emit the event
        emit NewPolicy(name, description, price, policies.length);
    }

    function registerNewSubscription(uint256 policyIndex, address agent) external payable {
        // Ensure the policy exists
        require(policyIndex < policies.length, "Invalid policy");

        // Ensure sufficient funds were sent
        require(policies[policyIndex].price <= msg.value);

        // Ensure the agent works for the organization
        require(agentToLevel[agent] != 0, "Invalid agent");

        // Ensure the current subscription has ended 
        require(subscriptions[msg.sender].expirationDate < block.timestamp, "Subscription not yet over");

        _handlePayment(agent, policies[policyIndex].price);

        // All subscriptions last one year
        uint256 expirationDate = block.timestamp + 365 days;

        subscriptions[msg.sender] = Subscription(policies[policyIndex], expirationDate);

        emit NewSubscription(msg.sender, policyIndex, agent, expirationDate);
    }

    /* Internal functions */
    function _handlePayment(address agent, uint256 value) internal {
        // If agent has no superiors, deposit the whole value with them
        if (inferiorToSuperior[agent] == address(0)) {
            _deposit(agent, value);
        } else {
            _deposit(agent, value * 8 / 10);
            _handlePayment(inferiorToSuperior[agent], value * 2 / 10);
        }
    }

    /* Getter functions */
    function getSuperiorOf(address agent) view external returns (address) {
        return inferiorToSuperior[agent];
    }

    function getInferiorsOf(address agent) view external returns (address[] memory) {
        return superiorToInferiors[agent];
    }
}