pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/** @title SwapTunnel 
 * 
 * @dev Implementation of the SwapTunnel contract.
 * It deadlocks ERC20 tockens and emit events on success.
 */
contract SwapTunnel {
    event Opened();
    event Swap(uint amount, string note);
    event Closed();

    bool public closed = false;
    ERC20 public erc20Contract;
    uint public criticBlock;
    uint public minimumAmount;

    /** @dev Construction of the ETH SwapTunnel contract.
     * @param _erc20Contract The address of the ERC20 contract to attract tockens from.
     * @param _criticBlock SwapTunnel can be closed after it.
     * @param _minimumAmount the smallest amount SwapTunnel can attract.
     */
    constructor(address _erc20Contract, uint _criticBlock, uint _minimumAmount) public {
        erc20Contract = ERC20(_erc20Contract);
        criticBlock = _criticBlock;
        minimumAmount = _minimumAmount;
        emit Opened();
    }

    /** @dev It closes the SwapTunnel if critical block has been reached.
     */
    function close() public {
        require(!closed, "This SwapTunnel contract's active period has expired.");
        require(block.number >= criticBlock, "SwapTunnel hasn't reached the critical mass");
        closed = true;
        emit Closed();
    }

    /** @dev swap attracts tokens and emit Swap event
     * @param note Swap event note.
     */
    function swap(string note) public {
        uint amount = attract();
        emit Swap(amount, note);
    }

    function attract() private returns (uint amount){
        require(!closed, "swapTunnel closed");
        uint balance = erc20Contract.balanceOf(msg.sender);
        uint allowed = erc20Contract.allowance(msg.sender, address(this));
        require(allowed >= minimumAmount, "less than minimum amount");
        require(balance == allowed, "swapTunnel must attract all your tokens");
        require(erc20Contract.transferFrom(msg.sender, address(this), balance), "swapTunnel can't attract your tokens");
        return balance;
    }
}
