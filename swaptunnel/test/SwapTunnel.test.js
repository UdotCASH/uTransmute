const BigNumber = web3.BigNumber;
require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

const SwapTunnel = artifacts.require('SwapTunnel');
const ERC20Token = artifacts.require('ERC20Token');

contract('SwapTunnel', accounts => {
    const erc20ContractAddress = 0x0;
    const criticBlock = 0;
    const minimumAmount = 0;

    it('correct deployed', async () => {
        const swapTunnel = await SwapTunnel.new(erc20ContractAddress, criticBlock, minimumAmount);
        swapTunnel.should.not.equal(null);
    });

    it('criticBlock set correctly', async () => {
        const criticBlock = 1000;
        const swapTunnel = await SwapTunnel.new(erc20ContractAddress, criticBlock, minimumAmount);
        const result = await swapTunnel.criticBlock();
        result.should.be.bignumber.equal(criticBlock);
    })

    it("new swapTunnel isn't closed", async () => {
        const swapTunnel = await SwapTunnel.new(erc20ContractAddress, criticBlock, minimumAmount);
        const closed = await swapTunnel.closed();
        closed.should.equal(false);
    });

    it("swapTunnel can close after criticBlock", async () => {
        const swapTunnel = await SwapTunnel.new(erc20ContractAddress, criticBlock, minimumAmount);
        await swapTunnel.close();
        const closed = await swapTunnel.closed();
        closed.should.equal(true);
    });

    it ("can't teleport if swapTunnel is closed", async () => {
        const swapTunnel = await SwapTunnel.new(erc20ContractAddress, criticBlock, minimumAmount);
        await swapTunnel.close();
        await swapTunnel.teleport("Give me a pizza").should.be.rejected;
    });

    it("teleport with invalid ERC20Contract", async () => {
        const swapTunnel = await SwapTunnel.new(0x0, criticBlock, minimumAmount);
        await swapTunnel.teleport("Give me another pizza").should.be.rejected;
    });

    it("swapTunnel can't close before criticBlock", async () => {
        const criticBlock = web3.eth.blockNumber + 1000;
        const swapTunnel = await SwapTunnel.new(erc20ContractAddress, criticBlock, minimumAmount);
        await swapTunnel.close().should.be.rejected;
        const closed = await swapTunnel.closed();
        closed.should.equal(false);
    });

    it("close when already closed throw", async () => {
        const swapTunnel = await SwapTunnel.new(erc20ContractAddress, criticBlock, minimumAmount);
        swapTunnel.close();
        await swapTunnel.close().should.be.rejected;
    });

    it('teleport with less than minimum balance', async () => {
        const name = 'ERC20 test';
        const symbol = 'SNS';
        const decimals = 8;
        const tokens = 100;

        const erc20Token = await ERC20Token.new(name, symbol, tokens, decimals);
        const swapTunnel = await SwapTunnel.new(erc20Token.address, criticBlock, 10000000001);

        await erc20Token.approve(swapTunnel.address, 10000000000);
        await swapTunnel.teleport("Now a caffe").should.be.rejected;
    });
});
