pragma solidity ^0.4.22;

import "./EosValidator.sol";
import "./SwapTunnel.sol";

/** @title SwapTunnelEosToAccount 
 * 
 * @dev It burns ERC20 tokens and log it with an associated EOS account.
 */
contract SwapTunnelEosAccount is EosValidator, SwapTunnel{
    constructor(address _erc20Contract, uint _criticBlock, uint _minimumAmount) public 
    SwapTunnel(_erc20Contract, _criticBlock, _minimumAmount)
    {
    }

    /** @dev It deadlocks your tokens and emit an event with amount and EOS account.
     */
    function swap(string eosAccount) public {
        require(isValidAccount(eosAccount), "not valid EOS account");
        super.swap(eosAccount);
    }
}
