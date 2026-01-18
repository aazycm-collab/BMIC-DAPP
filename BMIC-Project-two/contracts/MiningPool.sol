// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// 这是一个简化的单币质押挖矿合约 (Staking Rewards)
// 用户存入 LP Token (或任何代币)，挖取 BMIC
contract MiningPool is Ownable, ReentrancyGuard {
    // --- 核心变量 ---
    IERC20 public stakingToken; // 质押的币 (比如 LP Token)
    IERC20 public rewardToken;  // 奖励的币 (BMIC)

    // 每秒产出多少 BMIC (文档说日化 1.2%，这里由后端计算好每秒产量填入)
    uint256 public rewardRate;  
    
    // 挖矿结束时间
    uint256 public finishAt;
    
    // 最近一次更新奖励的时间
    uint256 public updatedAt;
    
    // 每单位质押代币累积的奖励数量
    uint256 public rewardPerTokenStored;

    // --- 用户数据 ---
    // 用户已领取的奖励快照
    mapping(address => uint256) public userRewardPerTokenPaid;
    // 用户待领取的奖励
    mapping(address => uint256) public rewards;
    // 用户当前的质押余额
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // --- 事件 ---
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    // --- 核心算法修饰器 ---
    // 每次用户操作(质押/提现/领奖)前，都必须先更新系统的奖励数据
    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            // 计算用户从上次操作到现在新挖到的币，加到待领取里
            rewards[_account] = earned(_account);
            // 更新用户的快照，表示这部分已经算过了
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

    // --- 辅助计算函数 ---
    
    // 计算当前有效时间（如果挖矿结束了，就按结束时间算）
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < finishAt ? block.timestamp : finishAt;
    }

    // 计算每 1 个质押币目前总共累积了多少奖励
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    // 查询用户当前一共挖了多少币 (含待领取)
    function earned(address _account) public view returns (uint256) {
        return
            ((balanceOf[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    // --- 用户操作功能 ---

    // 1. 质押 (Stake)
    function stake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
        emit Staked(msg.sender, _amount);
    }

    // 2. 提现本金 (Withdraw)
    function withdraw(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot withdraw 0");
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        stakingToken.transfer(msg.sender, _amount);
        emit Withdrawn(msg.sender, _amount);
    }

    // 3. 领取奖励 (Claim Reward)
    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.transfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    // --- 管理员功能 ---
    
    // 设置挖矿速率 (例如：每秒发 1 个 BMIC)
    // _duration: 挖矿持续多少秒
    function setRewardsDuration(uint256 _rewardRate, uint256 _duration) external onlyOwner updateReward(address(0)) {
        require(block.timestamp > finishAt, "Previous rewards not finished");
        rewardRate = _rewardRate;
        finishAt = block.timestamp + _duration;
        updatedAt = block.timestamp;
    }
}