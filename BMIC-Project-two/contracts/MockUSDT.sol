// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Tether USD", "USDT") {
        // 给部署者印 1亿 假U
        _mint(msg.sender, 100000000 * 10 ** 18);
    }
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}