// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title GSDCProxy
 * @dev UUPS Proxy contract for GSDC token
 * This proxy contract will hold the state and delegate calls to the implementation contract
 */
contract GSDCProxy is ERC1967Proxy {
    /**
     * @dev Initializes the proxy with implementation contract and initialization data
     * @param implementation Address of the GSDC implementation contract
     * @param data Encoded call to the implementation's initialize function
     */
    constructor(
        address implementation,
        bytes memory data
    ) ERC1967Proxy(implementation, data) {}
}
