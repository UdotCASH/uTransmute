const BigNumber = web3.BigNumber;
require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

const uTransmuteEosAccount = artifacts.require('uTransmuteEosAccount');
const ERC20Token = artifacts.require('ERC20Token');

contract('uTransmuteEosAccount', accounts => {
    const name = 'ERC20 test';
    const symbol = 'SNS';
    const decimals = 8;
    const tokens = 100;
    const minimumAmount = 0;

    const criticBlock = 0;
    const eosAccount = "te.mgr5ymass";

    it('transmute', async () => {
        const erc20Token = await ERC20Token.new(name, symbol, tokens, decimals);
        const uTransmute = await uTransmuteEosAccount.new(erc20Token.address, criticBlock, minimumAmount);

        let watcher = uTransmute.Transmute();

        await erc20Token.approve(uTransmute.address, 10000000000);
        await uTransmute.transmute(eosAccount);
        const uTransmuteBalance = await erc20Token.balanceOf(uTransmute.address);
        uTransmuteBalance.should.be.bignumber.equal(10000000000);
        const balance = await erc20Token.balanceOf(accounts[0]);
        balance.should.be.bignumber.equal(0);

        const events = await watcher.get();
        events.length.should.be.equal(1);
        events[0].args.note.should.be.equal(eosAccount);
        events[0].args.amount.should.be.bignumber.equal(10000000000);
    });
});

