const fs = require('fs');
const check = require('../../utils/Check');

var ERC20Token = artifacts.require("./ERC20Token.sol");
var SwapTunnel = artifacts.require("./SwapTunnelEosAccount.sol")

module.exports = function (deployer) {
  const configFile = "../config.json";
  //check(fs.existsSync(configFile), "configuration file: " + configFile);
  const config = JSON.parse(fs.readFileSync(configFile));
  //console.log(config)
  const name = "ERC20 Test";
  const symbol = config.swaptunnel.symbol;
  const decimals = config.swaptunnel.decimals;
  const tokens = config.swaptunnel.tokens;
  const genesisBlock = config.swaptunnel.critic_block;
  const minimumAmount = config.swaptunnel.minimum_amount;

  check(name, "ERC20 name: " + name);
  check(symbol, "ERC20 symbol: " + symbol);
  check(tokens, "ERC20 tokens: " + tokens);
  check(decimals, "ERC20 decimals: " + decimals);
  check(genesisBlock, "SwapTunnel critical block: " + genesisBlock);
  check(minimumAmount, "SwapTunnel minimum amount: " + minimumAmount);

  deployer.deploy(ERC20Token, name, symbol, tokens, decimals).then(() => {
    return deployer.deploy(SwapTunnel, ERC20Token.address, genesisBlock, minimumAmount);
  })
    .then(() => {
      fs.writeFileSync('../erc20_address', ERC20Token.address);
      fs.writeFileSync('../swaptunnel_address', SwapTunnel.address);
    })
};

