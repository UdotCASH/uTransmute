const BigNumber = web3.BigNumber;
require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

const SwapTunnelEosAccount = artifacts.require('SwapTunnelEosAccount');
const ERC20Token = artifacts.require('ERC20Token');

contract('SwapTunnelEosAccount', accounts => {
    const name = 'ERC20 test';
    const symbol = 'SNS';
    const decimals = 8;
    const tokens = 100;
    const minimumAmount = 0;

    const criticBlock = 0;
    const eosAccount = "te.mgr5ymass";

    it('swap', async () => {
        const erc20Token = await ERC20Token.new(name, symbol, tokens, decimals);
        const swapTunnel = await SwapTunnelEosAccount.new(erc20Token.address, criticBlock, minimumAmount);

        let watcher = swapTunnel.Swap();

        await erc20Token.approve(swapTunnel.address, 10000000000);
        await swapTunnel.swap(eosAccount);
        const swapTunnelBalance = await erc20Token.balanceOf(swapTunnel.address);
        swapTunnelBalance.should.be.bignumber.equal(10000000000);
        const balance = await erc20Token.balanceOf(accounts[0]);
        balance.should.be.bignumber.equal(0);

        const events = await watcher.get();
        events.length.should.be.equal(1);
        events[0].args.note.should.be.equal(eosAccount);
        events[0].args.amount.should.be.bignumber.equal(10000000000);
    });
});

