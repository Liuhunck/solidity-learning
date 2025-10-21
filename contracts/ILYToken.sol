// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ILYToken is ERC20 {
    address private immutable deployerAddress;

    uint256 public constant initialSupply = 10 ** 8 * (10 ** 18);

    constructor() ERC20("I Love You", "ILY") {
        deployerAddress = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    receive() external payable {
        _mint(msg.sender, msg.value * 10000);
    }

    fallback() external payable {
        _mint(msg.sender, msg.value * 10000);
    }

    function withdraw() external {
        require(msg.sender == deployerAddress, "only deployer can withdraw");
        uint256 amount = address(this).balance;
        (bool ok, ) = payable(deployerAddress).call{value: amount}("");
        require(ok, "call failed");
    }
}
