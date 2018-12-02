const BigNumber = web3.BigNumber;
require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

const SwapTunnelEosPublicKey = artifacts.require('SwapTunnelEosPublicKey');
const ERC20Token = artifacts.require('ERC20Token');

contract('SwapTunnelEosPublicKey', accounts => {
    const name = 'ERC20 test';
    const symbol = 'SNS';
    const decimals = 8;
    const tokens = 100;
    const minimumAmount = 0;

    const criticBlock = 0;
    const eosPublicKey = 'EOS7M38bvCoL7N3mBDbQyqePcK128G2b3so7XBa9hJn9uuKDN7we8';

    it('swap', async () => {
        const erc20Token = await ERC20Token.new(name, symbol, tokens, decimals);
        const swapTunnel = await SwapTunnelEosPublicKey.new(erc20Token.address, criticBlock, minimumAmount);

        let watcher = swapTunnel.Swap();

        await erc20Token.approve(swapTunnel.address, 10000000000);
        await swapTunnel.swap(eosPublicKey);
        const swapTunnelBalance = await erc20Token.balanceOf(swapTunnel.address);
        swapTunnelBalance.should.be.bignumber.equal(10000000000);
        const balance = await erc20Token.balanceOf(accounts[0]);
        balance.should.be.bignumber.equal(0);

        const events = await watcher.get();
        events.length.should.be.equal(1);
        events[0].args.note.should.be.equal(eosPublicKey);
        events[0].args.amount.should.be.bignumber.equal(10000000000);
    });
});

