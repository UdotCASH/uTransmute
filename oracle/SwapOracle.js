module.exports = (params) => {
    const { swapTunnel, onData } = params;

    swapTunnel.methods.closed().call()
    .then(result => {
        if (result === true){
            console.log("(EE) swapTunnel closed ... exiting");
            process.exit(0);
        }
    })

    swapTunnel.events.Swap({
//        fromBlock: 0
    })
        .on('data', event => {
            if (onData) {
                onData(event);
            }
            else
                console.log("(II) swapTunnel event " + event.returnValues);
        })
        .on('changed', reason => console.log("(WW) SwapOracle: " + reason))
        .on('error', reason => console.log("(EE) SwapOracle: " + reason));

    swapTunnel.events.Closed({
    })
        .on('data', () => {
            console.log("(END) swapTunnel closed ... exiting");
            process.exit(0);
        })
        .on('changed', reason => console.log("(WW) SwapOracle: " + reason))
        .on('error', reason => console.log("(EE) SwapOracle: " + reason));
}
