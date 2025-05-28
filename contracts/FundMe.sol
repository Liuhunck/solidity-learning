// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    uint256 constant MINIMUM_FUND = 1 * 10 ** 12;
    uint256 constant FUND_TARGET = 10 * 10 ** 15;

    address public owner;

    AggregatorV3Interface internal priceFeed;

    mapping(address => uint256) private addressToAmount;

    uint256 public deploymentTimestamp;
    uint256 public lockTime;

    bool public isGetFundCalled = false;

    address public fundMeTokenAddress;

    constructor(uint256 _lockTime) {
        owner = msg.sender;

        // sepolia ETH/USD price feed address
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );

        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable isUnlocked {
        require(msg.value >= MINIMUM_FUND, "fund more than 1 TWei");
        addressToAmount[msg.sender] += msg.value;
    }

    function refund() external isLocked {
        require(isGetFundCalled == false, "fund already taken");
        require(
            address(this).balance < FUND_TARGET,
            "target reached, cannot refund"
        );
        uint256 amount = addressToAmount[msg.sender];
        require(amount > 0, "you have no funds to refund");
        addressToAmount[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "call failed");
    }

    function getFundAmount() external view returns (uint256) {
        return addressToAmount[msg.sender];
    }

    function getFund() external isOwner isLocked {
        require(address(this).balance >= FUND_TARGET, "target not reached");
        (bool ok, ) = payable(owner).call{value: address(this).balance}("");
        require(ok, "call failed");
        isGetFundCalled = true;
    }

    function getBalanceUsd() public view returns (uint256) {
        return convertEthToUsd(address(this).balance);
    }

    function convertEthToUsd(uint256 ethNum) internal view returns (uint256) {
        return (ethNum * getEthToUsdPrise()) / (10 ** priceFeed.decimals());
    }

    function getEthToUsdPrise() internal view returns (uint256) {
        (, int256 rate, , , ) = priceFeed.latestRoundData();
        return uint256(rate);
    }

    function transferOwnership(address newOwner) external isOwner {
        require(newOwner != address(0), "new owner is zero address");
        owner = newOwner;
    }

    function setFundMeTokenAddress(
        address _fundMeTokenAddress
    ) external isOwner {
        fundMeTokenAddress = _fundMeTokenAddress;
    }

    function decreaseFundAmount(
        address user,
        uint256 amount
    ) external isFundMeToken isLocked {
        require(isGetFundCalled, "fund not taken yet");
        require(user != address(0), "user is zero address");
        require(
            addressToAmount[user] >= amount,
            "user does not have enough funds"
        );
        addressToAmount[user] -= amount;
    }

    modifier isOwner() {
        require(msg.sender == owner, "sender is not the owner!");
        _;
    }

    modifier isLocked() {
        require(
            block.timestamp < deploymentTimestamp + lockTime,
            "contract is not locked"
        );
        _;
    }

    modifier isUnlocked() {
        require(
            block.timestamp >= deploymentTimestamp + lockTime,
            "contract is locked"
        );
        _;
    }

    modifier isFundMeToken() {
        require(
            fundMeTokenAddress != address(0),
            "FundMeToken address is not set"
        );
        require(
            msg.sender == fundMeTokenAddress,
            "only FundMeToken contract can call this function"
        );
        _;
    }
}
