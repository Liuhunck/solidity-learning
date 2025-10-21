const { task } = require("hardhat/config");

task("deploy-erc20", "Deploy and verify ERC20 contract")
    .addParam("name", "The name of the ERC20 token")
    .setAction(async (args, hre) => {
        const factory = await ethers.getContractFactory(args.name);

        console.log("contract is deploying");
        const contract = await factory.deploy();
        await contract.waitForDeployment();
        console.log(`contract has been deployed successfully, contract address is ${contract.target}`);

        if (hre.network.name === "hardhat") {
            console.log("skip waiting for confirmations on hardhat network");
        } else {
            console.log(`waiting for 5 confirmations`);
            await contract.deploymentTransaction().wait(5);
        }

        // const contract = factory.attach("0xE97AEc896406BcC5FcBa54b76257793Caf98a6a6");

        // if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        //     await verifyContract(contract.target, []);
        // } else {
        //     console.log("verification skipped...");
        // }

        console.log(`ERC20 name: ${await contract.name()}`);
        console.log(`ERC20 symbol: ${await contract.symbol()}`);
        console.log(
            `ERC20 total supply: ${ethers.formatUnits(await contract.totalSupply(), await contract.decimals())}`
        );

        const signer = (await ethers.getSigners())[0];
        const balance = await ethers.provider.getBalance(signer.address);
        const balanceT = await contract.balanceOf(signer.address);
        console.log(`deployer address: ${signer.address}`);
        console.log(`deployer balance: ${ethers.formatEther(balance)}`);
        console.log(`deployer token balance: ${ethers.formatUnits(balanceT, await contract.decimals())}`);

        if (hre.network.name !== "eth_sepolia" && hre.network.name !== "hardhat") {
            console.log("skip transfer and withdraw test on non-test network");
            return;
        }

        return;

        const signer1 = (await ethers.getSigners())[1];
        const balance1 = await ethers.provider.getBalance(signer1.address);
        const balanceT1 = await contract.balanceOf(signer1.address);
        console.log(`test address: ${signer1.address}`);
        console.log(`test address balance: ${ethers.formatEther(balance1)}`);
        console.log(`test address token balance: ${ethers.formatUnits(balanceT1, await contract.decimals())}`);

        const transferTx = await contract.transfer(
            signer1.address,
            ethers.parseUnits("1000", await contract.decimals())
        );
        await transferTx.wait();
        console.log(`transferred 1000 tokens to ${signer1.address}`);

        const balanceTAfter = await contract.balanceOf(signer.address);
        console.log(
            `deployer token balance after transfer: ${ethers.formatUnits(balanceTAfter, await contract.decimals())}`
        );
        const balanceT1After = await contract.balanceOf(signer1.address);
        console.log(
            `test address token balance after transfer: ${ethers.formatUnits(
                balanceT1After,
                await contract.decimals()
            )}`
        );

        const tx = await signer1.sendTransaction({
            to: contract.target,
            value: ethers.parseEther("0.01"),
        });
        await tx.wait();
        console.log(`transferred 0.01 ETH to ${contract.target}`);

        const token1After = await contract.balanceOf(signer1.address);
        const balance1After = await ethers.provider.getBalance(signer1.address);
        const contractBalance = await ethers.provider.getBalance(contract.target);
        console.log(`contract balance: ${ethers.formatEther(contractBalance)}`);
        console.log(`test address balance after transfer: ${ethers.formatEther(balance1After)}`);
        console.log(
            `test address token balance after sending ETH: ${ethers.formatUnits(
                token1After,
                await contract.decimals()
            )}`
        );

        await contract.withdraw();
        console.log(`withdraw ETH from contract`);

        const signerBalanceAfter = await ethers.provider.getBalance(signer.address);
        const contractBalanceAfter = await ethers.provider.getBalance(contract.target);
        console.log(`deployer balance after withdraw: ${ethers.formatEther(signerBalanceAfter)}`);
        console.log(`contract balance after withdraw: ${ethers.formatEther(contractBalanceAfter)}`);
    });

async function verifyContract(addr, args) {
    await hre.run("verify:verify", {
        address: addr,
        constructorArguments: args,
    });
}
