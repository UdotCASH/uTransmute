const fs = require('fs');
const Web3 = require('web3');
const EosJs = require('eosjs');
const check = require('./utils/Check');

const createWormHole = require('./oracle/TransmuteOracle.js');

console.log("ERC20 transmuting starts ...");

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
const uTransmuteFile = "./utransmute/build/contracts/uTransmuteEosAccount.json";
const ethereumProvider = params.utransmute.websocket_provider;
const eosioTokenAddress = params.eosiotoken.account;
const uTransmuteAddress = fs.readFileSync('./utransmute_address', 'utf-8')
const decimals = params.utransmute.decimals;
const symbol = params.utransmute.symbol;
const chainId = params.eosiotoken.chain_id;

check(Web3.utils.isAddress(uTransmuteAddress), "utransmute account: " + uTransmuteAddress);
check(eosioTokenAddress, "eosio.token account: " + eosioTokenAddress);
check(eosioTokenKey, 'eosio.token key: ' + eosioTokenKey);
check(ethereumProvider, "Ethereum provider: " + ethereumProvider);
//check(fs.existsSync(uTransmuteFile), "utransmute file: " + uTransmuteFile);
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

const input = fs.readFileSync(uTransmuteFile);
const contract = JSON.parse(input.toString());
const abi = contract.abi;

const websocketProvider = new Web3.providers.WebsocketProvider(ethereumProvider);
const web3 = new Web3(websocketProvider);
const uTransmute = new web3.eth.Contract(abi, uTransmuteAddress);
const eos = EosJs(eosConfig);
eos.getInfo({})
    .then(result => {
        return eos.contract(eosioTokenAddress)
            .then(eosioToken => {
                createWormHole({
                    uTransmute,
                    onData: event => {
                        const { amount, note } = event.returnValues;
                        const amountFloat = (amount/10**decimals).toFixed(decimals);
                        const amountWithSymbol = amountFloat + " " + symbol;
                        console.log("(EVENT) amount=" + amountWithSymbol + ", to=" + note);

                        eosioToken.issue(note, amountWithSymbol, "Emerged from eosioToken")
                            .catch(console.error);
                    }
                });
                console.log("(II) waiting utransmute events ...");
            })
            .catch(reason => {
                console.log("error" + reason);
                process.exit();
            });
    });
