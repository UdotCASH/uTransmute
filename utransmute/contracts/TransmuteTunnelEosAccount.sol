pragma solidity ^0.4.22;

import "./EosValidator.sol";
import "./uTransmute.sol";

/** @title uTransmuteEosToAccount 
 * 
 * @dev It burns ERC20 tokens and log it with an associated EOS account.
 */
contract uTransmuteEosAccount is EosValidator, uTransmute{
    constructor(address _erc20Contract, uint _criticBlock, uint _minimumAmount) public 
    uTransmute(_erc20Contract, _criticBlock, _minimumAmount)
    {
    }

    /** @dev It deadlocks your tokens and emit an event with amount and EOS account.
     */
    function transmute(string eosAccount) public {
        require(isValidAccount(eosAccount), "not valid EOS account");
        super.transmute(eosAccount);
    }
}
