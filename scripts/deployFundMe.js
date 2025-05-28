const { ethers } = require("hardhat");

async function main() {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");

    // deploy contract from factory
    console.log("contract is deploying");
    const fundMe = await fundMeFactory.deploy(10);
    await fundMe.waitForDeployment();
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);

    //verify the deployment of contract
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("waiting for 5 confirmations");
        await fundMe.deploymentTransaction().wait(5);
        await verifyFundMe(fundMe.target, [10]);
    } else {
        console.log("verification skipped...");
    }

    // init two accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // fund contract with first account
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.001") });
    await fundTx.wait();

    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log(`balance of the contract is ${ethers.utils.formatEther(balanceOfContract)}`);

    // fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.001") });
    await fundTxWithSecondAccount.wait();

    // check balance of contract
    const balanceOfContractAfterSecondFunding = await ethers.provider.getBalance(fundMe.target);
    console.log(`balance of the contract is ${ethers.utils.formatEther(balanceOfContractAfterSecondFunding)}`);

    // check mapping
    const firstAccountFund = await fundMe.connect(firstAccount).getFundAmount();
    const secondAccountFund = await fundMe.connect(secondAccount).getFundAmount();
    console.log(`first account ${firstAccount.address} funded ${ethers.utils.formatEther(firstAccountFund)}`);
    console.log(`second account ${secondAccount.address} funded ${ethers.utils.formatEther(secondAccountFund)}`);
}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

main()
    .then()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
