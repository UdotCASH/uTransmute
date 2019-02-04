const fs = require('fs');
const check = require('../../utils/Check');

var ERC20Token = artifacts.require("./ERC20Token.sol");
var uTransmute = artifacts.require("./uTransmuteEosAccount.sol")

module.exports = function (deployer) {
  const configFile = "../config.json";
  //check(fs.existsSync(configFile), "configuration file: " + configFile);
  const config = JSON.parse(fs.readFileSync(configFile));
  //console.log(config)
  const name = "ERC20 Test";
  const symbol = config.utransmute.symbol;
  const decimals = config.utransmute.decimals;
  const tokens = config.utransmute.tokens;
  const genesisBlock = config.utransmute.critic_block;
  const minimumAmount = config.utransmute.minimum_amount;

  check(name, "ERC20 name: " + name);
  check(symbol, "ERC20 symbol: " + symbol);
  check(tokens, "ERC20 tokens: " + tokens);
  check(decimals, "ERC20 decimals: " + decimals);
  check(genesisBlock, "uTransmute critical block: " + genesisBlock);
  check(minimumAmount, "uTransmute minimum amount: " + minimumAmount);

  deployer.deploy(ERC20Token, name, symbol, tokens, decimals).then(() => {
    return deployer.deploy(uTransmute, ERC20Token.address, genesisBlock, minimumAmount);
  })
    .then(() => {
      fs.writeFileSync('../erc20_address', ERC20Token.address);
      fs.writeFileSync('../utransmute_address', uTransmute.address);
    })
};

