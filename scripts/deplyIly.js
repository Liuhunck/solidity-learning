const { ethers } = require("hardhat");

async function main() {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("ILYToken");

    // deploy contract from factory
    console.log("contract is deploying");
    const iLy = await fundMeFactory.deploy();
    await iLy.waitForDeployment();
    console.log(`contract has been deployed successfully, contract address is ${iLy.target}`);

    //verify the deployment of contract
    if (hre.network.config.chainId != 11155111 || !process.env.ETHERSCAN_API_KEY) {
        console.log("verification skipped...");
        return;
    }

    console.log("waiting for 5 confirmations");
    await iLy.deploymentTransaction().wait(5);
    await verifyContract(iLy.target, []);

    const [account] = await ethers.getSigners();

    const tx = await account.sendTransaction({
        to: iLy.target,
        value: ethers.parseEther("0.0001"),
    });
    await tx.wait();

    const balanceOfContract = await ethers.provider.getBalance(iLy.target);
    console.log(`balance of the contract is ${ethers.formatEther(balanceOfContract)}`);

    const balanceOfAccount = await iLy.balanceOf(account.address);
    console.log(`balance of address ${account.address} is ${ethers.formatUnits(balanceOfAccount, iLy.decimals)}`);
}

async function verifyContract(addr, args) {
    await hre.run("verify:verify", {
        address: addr,
        constructorArguments: args,
    });
}

main()
    .then()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
