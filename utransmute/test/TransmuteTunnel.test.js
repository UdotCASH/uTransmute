const BigNumber = web3.BigNumber;
require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

const uTransmute = artifacts.require('uTransmute');
const ERC20Token = artifacts.require('ERC20Token');

contract('uTransmute', accounts => {
    const erc20ContractAddress = 0x0;
    const criticBlock = 0;
    const minimumAmount = 0;

    it('correct deployed', async () => {
        const uTransmute = await uTransmute.new(erc20ContractAddress, criticBlock, minimumAmount);
        uTransmute.should.not.equal(null);
    });

    it('criticBlock set correctly', async () => {
        const criticBlock = 1000;
        const uTransmute = await uTransmute.new(erc20ContractAddress, criticBlock, minimumAmount);
        const result = await uTransmute.criticBlock();
        result.should.be.bignumber.equal(criticBlock);
    })

    it("new uTransmute isn't closed", async () => {
        const uTransmute = await uTransmute.new(erc20ContractAddress, criticBlock, minimumAmount);
        const closed = await uTransmute.closed();
        closed.should.equal(false);
    });

    it("uTransmute can close after criticBlock", async () => {
        const uTransmute = await uTransmute.new(erc20ContractAddress, criticBlock, minimumAmount);
        await uTransmute.close();
        const closed = await uTransmute.closed();
        closed.should.equal(true);
    });

    it ("can't transmute if uTransmute is closed", async () => {
        const uTransmute = await uTransmute.new(erc20ContractAddress, criticBlock, minimumAmount);
        await uTransmute.close();
        await uTransmute.transmute("Give me a pizza").should.be.rejected;
    });

    it("transmute with invalid ERC20Contract", async () => {
        const uTransmute = await uTransmute.new(0x0, criticBlock, minimumAmount);
        await uTransmute.transmute("Give me another pizza").should.be.rejected;
    });

    it("uTransmute can't close before criticBlock", async () => {
        const criticBlock = web3.eth.blockNumber + 1000;
        const uTransmute = await uTransmute.new(erc20ContractAddress, criticBlock, minimumAmount);
        await uTransmute.close().should.be.rejected;
        const closed = await uTransmute.closed();
        closed.should.equal(false);
    });

    it("close when already closed throw", async () => {
        const uTransmute = await uTransmute.new(erc20ContractAddress, criticBlock, minimumAmount);
        uTransmute.close();
        await uTransmute.close().should.be.rejected;
    });

    it('transmute with less than minimum balance', async () => {
        const name = 'ERC20 test';
        const symbol = 'SNS';
        const decimals = 8;
        const tokens = 100;

        const erc20Token = await ERC20Token.new(name, symbol, tokens, decimals);
        const uTransmute = await uTransmute.new(erc20Token.address, criticBlock, 10000000001);

        await erc20Token.approve(uTransmute.address, 10000000000);
        await uTransmute.transmute("Now a caffe").should.be.rejected;
    });
});
