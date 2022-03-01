// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

/**
 * @title ControllerBase
 *
 * @dev Contract to hold all storage for the `Controller`
 */
abstract contract ControllerBase {

    /* ROLES */
    bytes32 public constant PRINCIPAL_ROLE = keccak256("PRINCIPAL_ROLE");

    /* STRUCTS */

    /**
     * @dev Represents the current level of the agent
     */
    struct AgentLevel {
        address agentAddress;
        uint8 level;
    }

    /**
     * @dev Represents a mapping from superior to her inferiors
     */
    struct SuperiorToInferiors {
        address superior;
        address[] inferiors;
    }

    /**
     * @dev Represents a mapping from inferior to their superior
     */
    struct InferiorToSuperior {
        address inferior;
        address superior;
    }

    /**
     * @dev Struct to hold the details of a given insurance policy
     */
    struct Policy {
        bytes32 name;
        bytes32 description;
        uint256 price;
    }

    /**
     * @dev Struct to hold the details of a given subscription
     */
    struct Subscription {
        Policy policy;
        uint256 expirationDate;
    }

    /* STATE VARIABLES */

    /**
     * @dev Maps inferiors to their superiors
     */
    mapping(address => address) internal inferiorToSuperior;

    /**
     * @dev Maps superiors to their inferiors
     */
    mapping(address => address[]) internal superiorToInferiors;

    /**
     * @dev Maps an agent to their level
     */
    mapping(address => uint8) public agentToLevel;

    /**
     * @dev Maps an agent to their points
     */
    mapping(address => uint8) public agentToPoints;

    /**
     * @dev Array of all available policies
     */
    Policy[] public policies;

    /**
     * @dev Mapping of a subscription holder to their subscription
     */
    mapping(address => Subscription) public subscriptions;


    /* EVENTS */

    /**
     * @dev Emiited when an agent gets a new superior
     */
    event SuperiorChanged(address agent, address newSuperior);

    /**
     * @dev Emiited when an agent gets a new level
     */
    event LevelChanged(address agent, uint8 level);

    /**
     * @dev Emitted upon a new policy
     */
    event NewPolicy(bytes32 name, bytes32 description, uint256 price, uint256 policyIndex);

    /**
     * @dev Emitted upon a new subscription
     */
    event NewSubscription(address subscriber, uint256 policy, address agent, uint256 expirationDate);
}
