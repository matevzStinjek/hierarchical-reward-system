// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./HRSAccessControl.sol";

contract HRSProductController is HRSAccessControl {

    constructor(
        address _principal
    ) HRSAccessControl(_principal) {}

    mapping(bytes32 => address) public products;

    bytes32[] internal _productKeys;

    // addProduct () {}

    // removeProduct () {}
}
