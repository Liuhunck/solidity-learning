// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FundMeToken is ERC20 {
    address public immutable fundMeAddress;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    modifier onlyFundMe() {
        require(msg.sender == fundMeAddress, "Only FundMe contract can call this function");
        _;
    }

    function mint(address to, uint256 amount) external onlyFundMe {
        _mint(to, amount);
    }
}