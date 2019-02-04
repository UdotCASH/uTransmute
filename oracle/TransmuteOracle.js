module.exports = (params) => {
    const { uTransmute, onData } = params;

    uTransmute.methods.closed().call()
    .then(result => {
        if (result === true){
            console.log("(EE) uTransmute closed ... exiting");
            process.exit(0);
        }
    })

    uTransmute.events.Transmute({
//        fromBlock: 0
    })
        .on('data', event => {
            if (onData) {
                onData(event);
            }
            else
                console.log("(II) uTransmute event " + event.returnValues);
        })
        .on('changed', reason => console.log("(WW) TransmuteOracle: " + reason))
        .on('error', reason => console.log("(EE) TransmuteOracle: " + reason));

    uTransmute.events.Closed({
    })
        .on('data', () => {
            console.log("(END) uTransmute closed ... exiting");
            process.exit(0);
        })
        .on('changed', reason => console.log("(WW) TransmuteOracle: " + reason))
        .on('error', reason => console.log("(EE) TransmuteOracle: " + reason));
}
