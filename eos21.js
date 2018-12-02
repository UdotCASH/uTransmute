const fs = require('fs');
const Web3 = require('web3');
const EosJs = require('eosjs');
const check = require('./utils/Check');

const createWormHole = require('./oracle/TeleportOracle.js');

console.log("ERC20 teleporting starts ...");

const getParams = () => {
    const argv = require('minimist')(process.argv.slice(2), {
        default: {
            config: 'config.json'
        }
    });

    const configFile = argv.config;
    check(fs.existsSync(configFile), "configuration file: " + configFile);
    const config = JSON.parse(fs.readFileSync(configFile));
    return config;
}

const params = getParams();

const eosioTokenKey = params.eosiotoken.private_key;
const eosProvider = params.eosiotoken.http_endpoint;
const swapTunnelFile = "./swaptunnel/build/contracts/SwapTunnelEosAccount.json";
const ethereumProvider = params.swaptunnel.websocket_provider;
const eosioTokenAddress = params.eosiotoken.account;
const swapTunnelAddress = fs.readFileSync('./swaptunnel_address', 'utf-8')
const decimals = params.swaptunnel.decimals;
const symbol = params.swaptunnel.symbol;
const chainId = params.eosiotoken.chain_id;

check(Web3.utils.isAddress(swapTunnelAddress), "swaptunnel account: " + swapTunnelAddress);
check(eosioTokenAddress, "eosio.token account: " + eosioTokenAddress);
check(eosioTokenKey, 'eosio.token key: ' + eosioTokenKey);
check(ethereumProvider, "Ethereum provider: " + ethereumProvider);
//check(fs.existsSync(swapTunnelFile), "swaptunnel file: " + swapTunnelFile);
check(eosProvider, "EOS provider: " + eosProvider);
check(symbol, "ERC20 symbol: " + symbol);
check(decimals, "ERC20 decimals: " + decimals);
check(chainId, "chain_id: " + chainId);

eosConfig = {
    chainId: chainId, // 32 byte (64 char) hex string
    keyProvider: [eosioTokenKey], // WIF string or array of keys..
    httpEndpoint: eosProvider,
    expireInSeconds: 60,
    broadcast: true,
    verbose: false, // API activity
    sign: true,
    authorization: eosioTokenAddress + '@active'
};

const input = fs.readFileSync(swapTunnelFile);
const contract = JSON.parse(input.toString());
const abi = contract.abi;

const websocketProvider = new Web3.providers.WebsocketProvider(ethereumProvider);
const web3 = new Web3(websocketProvider);
const swapTunnel = new web3.eth.Contract(abi, swapTunnelAddress);
const eos = EosJs(eosConfig);
eos.getInfo({})
    .then(result => {
        return eos.contract(eosioTokenAddress)
            .then(eosioToken => {
                createWormHole({
                    swapTunnel,
                    onData: event => {
                        const { amount, note } = event.returnValues;
                        const amountFloat = (amount/10**decimals).toFixed(decimals);
                        const amountWithSymbol = amountFloat + " " + symbol;
                        console.log("(EVENT) amount=" + amountWithSymbol + ", to=" + note);
                        
                        eosioToken.issue(note, amountWithSymbol, "Emerged from eosioToken")
                            .catch(console.error);
                    }
                });
                console.log("(II) waiting swaptunnel events ...");
            })
            .catch(reason => {
                console.log("error" + reason);
                process.exit();
            });
    });

