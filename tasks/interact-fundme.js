const { task } = require("hardhat/config");

task("interact-fundme", "Interact with FundMe contract")
    .addParam("addr", "The address of the FundMe contract")
    .setAction(async (args, hre) => {
        // create factory and attach to existing contract
        const fundMeFactory = await ethers.getContractFactory("FundMe");
        const fundMe = fundMeFactory.attach(args.addr);

        // init two accounts
        const [firstAccount, secondAccount] = await ethers.getSigners();

        // fund contract with first account
        const fundTx = await fundMe.connect(firstAccount).fund({ value: ethers.parseEther("0.001") });
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
    });
