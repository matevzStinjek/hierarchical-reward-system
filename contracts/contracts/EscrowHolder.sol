// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// Exterior
import "@openzeppelin/contracts/utils/escrow/Escrow.sol";

/**
 * @title EscrowHolder
 *
 * @dev Contract to provide external access to an internally held `escrow`
 */
contract EscrowHolder {
    /**
     * @dev EscrowUpgradeable used underneath the proxy
     */
    Escrow public escrow;

    /**
     * @dev Deposits `amount` into escrow account for `_payee`
     */
    function _deposit(address _payee, uint256 amount) internal {
        escrow.deposit{value: amount}(_payee);
    }

    /**
     * @dev Wraps the `withdraw` function of the `escrow`
     */
    function _withdraw(address _payee) internal {
        escrow.withdraw(payable(_payee));
    }

    /**
     * @notice Deposit `msg.value` into `_payee`'s account
     *
     * @dev Wraps the `deposit` function.
     * @dev Use this pattern to ensure that `msg.value` is passed on.
     *
     * @param _payee {address} - The address to deposit to
     */
    function deposit(address _payee) external payable {
        _deposit(_payee, msg.value);
    }

    /**
     * @notice See all the deposits currently held for `_payee`
     *
     * @dev Wraps the `depositsOf` function
     *
     * @param _payee - The address to check the deposits of
     * @return {uint256} - The amount of deposits the user has
     */
    function depositsOf(address _payee) external view returns (uint256) {
        return escrow.depositsOf(_payee);
    }

    /**
     * @notice Withdraw all funds held in the escrow
     */
    function withdraw() public {
        _withdraw(msg.sender);
    }
}
