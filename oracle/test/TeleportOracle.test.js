const Web3 = require('web3');
const ganache = require('ganache-cli');
const EthCrypto = require('eth-crypto');
const fs = require('fs');
require('chai').use(require('chai-as-promised')).should();

const wormHole = require('../TeleportOracle.js');
const erc20Deployer = require('./ERC20Deployer.js');
const swapTunnelDeployer = require('./SwapTunnelDeployer.js');


var identities = []
const identitiesCount = 10;
for (let i = 0; i < identitiesCount; i++) {
    identities.push(EthCrypto.createIdentity());
}

// create a ganache-provider
const ganacheProvider = ganache.provider({
    // we preset the balance of our identities to 10 ether
    accounts: identities.map(identity => ({secretKey: identity.privateKey, balance: Web3.utils.toWei('100', 'ether') })),
});

// set ganache to web3 as provider
const web3 = new Web3(ganacheProvider);

describe('teleport ERC20 tokens', () => {
    let erc20Contract;
    let swapTunnelContract;

    beforeEach(async () => {
        // deploy ERC20 contract
        erc20Contract = await erc20Deployer({
            http_provider: ganacheProvider,
            contract_file: '../swaptunnel/build/contracts/ERC20Token.json',
            sender: identities[0].address,
            gas: 3000000,
            gasPrice: 20,
            name: "ERC20 Test",
            symbol: "TEST",
            decimals: "4",
            tokens: "100"
        });
        erc20Contract.should.not.equal(null);

        swapTunnelContract = await swapTunnelDeployer({
            // deploy SwapTunnel contract
            http_provider: ganacheProvider,
            contract_file: '../swaptunnel/build/contracts/SwapTunnelEosAccount.json',
            sender: identities[0].address,
            erc20_address: erc20Contract.options.address,
            critic_block: 0,
            minimum_amount: 0,
            gas: 3000000,
            gasPrice: 20
        });
        swapTunnelContract.should.not.equal(null);

        // transfer ERC20 tokens to accounts
        const amount = 10;
        for (let i = 0; i < identitiesCount; i++) {
            await erc20Contract.methods.transfer(identities[i].address, amount).send({ from: identities[0].address, gas: 3000000 });
        }
    });

    it('SwapTunnel is opened', async () => {
        // Check SwapTunnel is not closed
        swapTunnelContract.methods.closed().call({ from: identities[0].address }).should.eventually.be.false;
    });

    it('teloportToAccount', async () => {
        let count = 0;

        wormHole({ swapTunnel: swapTunnelContract, onData: () => count++ });

        for (let i = 0; i < identitiesCount; i++) {
            let amount = await erc20Contract.methods.balanceOf(identities[i].address).call({ from: identities[i].address , gas: 3000000});
            await erc20Contract.methods.approve(swapTunnelContract.options.address, amount).send({ from: identities[i].address , gas: 3000000});
            const allowed = await erc20Contract.methods.allowance(identities[i].address, swapTunnelContract.options.address).call();
            allowed.should.be.equal(amount);
            await swapTunnelContract.methods.teleport("te.mgr5ymass").send({ from: identities[i].address , gas: 3000000});
            result = await erc20Contract.methods.balanceOf(identities[i].address).call({ from: identities[i].address , gas: 3000000});
            result.should.be.equal('0');
        }
        count.should.be.equal(identitiesCount);
    });

    it('wormhole gets past teleportations', async () => {
        let count = 0;
        wormHole({ swapTunnel: swapTunnelContract, onData: () => count++ });

        for (let i = 0; i < 2; i++) {
            let tokenBalance = await erc20Contract.methods.balanceOf(identities[i].address).call({ from: identities[i].address , gas: 3000000});
            await erc20Contract.methods.approve(swapTunnelContract.options.address, tokenBalance).send({ from: identities[i].address , gas: 3000000});
            const allowed = await erc20Contract.methods.allowance(identities[i].address, swapTunnelContract.options.address).call();
            allowed.should.be.equal(tokenBalance);
            await swapTunnelContract.methods.teleport("te.mgr5ymass").send({ from: identities[i].address , gas: 3000000});
            tokenBalance = await erc20Contract.methods.balanceOf(identities[i].address).call({ from: identities[i].address , gas: 3000000});
            tokenBalance.should.be.equal('0');
        }

        count.should.be.equal(2);
    });
});

