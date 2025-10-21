require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("./tasks");
// const { ProxyAgent, setGlobalDispatcher } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);

// preload the env variables, else .sol file will not be able to use solidity plugin
const ETH_SEPOLIA_URL = process.env.ETH_SEPOLIA_URL;
const ETH_MAINNET_URL = process.env.ETH_MAINNET_URL;

const BNB_TESTNET_URL = process.env.BNB_TESTNET_URL;
const BNB_MAINNET_URL = process.env.BNB_MAINNET_URL;

const ACCOUNT_0 = process.env.ACCOUNT_0;
const TEST_ACCOUNT_0 = process.env.TEST_ACCOUNT_0;
const TEST_ACCOUNT_1 = process.env.TEST_ACCOUNT_1;

const ACCOUNTS = [ACCOUNT_0];
const TEST_ACCOUNTS = [TEST_ACCOUNT_0, TEST_ACCOUNT_1];

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28",
    defaultNetwork: "hardhat",
    networks: {
        eth_sepolia: {
            url: ETH_SEPOLIA_URL,
            accounts: TEST_ACCOUNTS,
            chainId: 11155111,
        },
        eth_mainnet: {
            url: ETH_MAINNET_URL,
            // accounts: ACCOUNTS,
            chainId: 1,
        },
        bnb_testnet: {
            url: BNB_TESTNET_URL,
            accounts: TEST_ACCOUNTS,
            chainId: 97,
        },
        bnb_mainnet: {
            url: BNB_MAINNET_URL,
            accounts: ACCOUNTS,
            chainId: 56,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    sourcify: {
        enabled: true,
    },
};
