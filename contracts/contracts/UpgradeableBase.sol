// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

abstract contract UpgradeableBase is
    Initializable,
    AccessControlEnumerableUpgradeable
{
    // Add to protect against UUPS threat
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    /**
     * @notice Initiailization function called from the Proxy pattern.
     *
     * @dev Sets up a base admin role
     */
    function __UpgradeableBase_init() internal initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
