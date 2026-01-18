// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BMICToken is ERC20, Ownable {
    constructor() ERC20("BMIC Token", "BMIC") Ownable(msg.sender) {
        // 给部署者印 20亿 BMIC
        _mint(msg.sender, 2000000000 * 10 ** 18);
    }
}