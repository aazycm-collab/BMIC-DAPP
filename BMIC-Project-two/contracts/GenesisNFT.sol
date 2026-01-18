// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GenesisNFT is ERC721, Ownable, ReentrancyGuard {
    // --- 核心配置 ---
    IERC20 public usdtToken;
    address public fundWallet; 
    address public teamWallet; 

    uint256 public constant MAX_SUPPLY = 6000;      
    uint256 public constant PRICE = 200 * 10**18;   
    uint256 public totalSupply;

    // --- 用户关系 ---
    mapping(address => address) public referrers; // 记录上级
    mapping(address => bool) public hasMinted;    // 记录是否买过

    // --- 事件 ---
    event NFTMinted(address indexed user, uint256 tokenId, address referrer);
    
    constructor(
        address _usdtToken,
        address _fundWallet,
        address _teamWallet
    ) ERC721("BMIC Genesis Card", "BMIC-G") Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT");
        require(_fundWallet != address(0), "Invalid Fund Wallet");
        require(_teamWallet != address(0), "Invalid Team Wallet");

        usdtToken = IERC20(_usdtToken);
        fundWallet = _fundWallet;
        teamWallet = _teamWallet;
    }

    // --- 核心功能：铸造 ---
    function mint(address referrer) external nonReentrant {
        require(totalSupply < MAX_SUPPLY, "Sold out");
        require(!hasMinted[msg.sender], "One per wallet");
        require(referrer != msg.sender, "Cannot refer self");

        // 1. 扣款与分账
        uint256 amountFund = (PRICE * 60) / 100; // 120 U
        uint256 amountTeam = (PRICE * 30) / 100; // 60 U
        uint256 amountRef  = (PRICE * 10) / 100; // 20 U

        // 检查授权
        uint256 allowance = usdtToken.allowance(msg.sender, address(this));
        require(allowance >= PRICE, "Please approve USDT first");

        // 转账逻辑
        usdtToken.transferFrom(msg.sender, fundWallet, amountFund);
        usdtToken.transferFrom(msg.sender, teamWallet, amountTeam);

        // 绑定推荐关系 (如果还没绑过)
        if (referrers[msg.sender] == address(0) && referrer != address(0)) {
            referrers[msg.sender] = referrer;
        }
        
        // 处理推荐奖励
        address finalReferrer = referrers[msg.sender];
        if (finalReferrer != address(0)) {
            // 有上级，给上级
            usdtToken.transferFrom(msg.sender, finalReferrer, amountRef);
        } else {
            // 无上级，回流金库
            usdtToken.transferFrom(msg.sender, fundWallet, amountRef);
        }

        // 2. 铸造 NFT
        hasMinted[msg.sender] = true;
        totalSupply++;
        uint256 newTokenId = totalSupply;

        _safeMint(msg.sender, newTokenId);
        emit NFTMinted(msg.sender, newTokenId, finalReferrer);
    }

    // --- 🛑 核心修改：灵魂绑定 (SBT) 逻辑 ---
    // 这是 OpenZeppelin v5.0 的标准钩子函数
    // 每次发生 NFT 转移时，都会自动运行这个函数
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // from != 0 表示这不是“铸造”
        // to != 0 表示这不是“销毁”
        // 如果既不是铸造也不是销毁，那就是转账 -> 报错拦截！
        if (from != address(0) && to != address(0)) {
            revert("BMIC: NFT is Soulbound (Non-transferable)");
        }

        return super._update(to, tokenId, auth);
    }
}