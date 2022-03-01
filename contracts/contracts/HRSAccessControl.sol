// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HRSAccessControl is AccessControl {

    bytes32 public constant PRINCIPAL_ROLE = keccak256("PRINCIPAL_ROLE");

    // event onPrincipalChanged

    constructor(address _principal) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PRINCIPAL_ROLE, _principal);
    }
}
