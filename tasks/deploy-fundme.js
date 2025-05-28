const { task } = require("hardhat/config");

task("deploy-fundme", "Deploy and verify FundMe contract").setAction(async (args, hre) => {
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
});

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}
