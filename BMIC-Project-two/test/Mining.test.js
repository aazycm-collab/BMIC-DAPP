const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("BMIC 挖矿系统测试", function () {
  let MockUSDT, lpToken;
  let BMICToken, rewardToken;
  let MiningPool, pool;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // 1. 部署 LP Token (我们暂时用 MockUSDT 代替 LP Token 进行测试)
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    lpToken = await MockUSDTFactory.deploy();
    await lpToken.waitForDeployment();

    // 2. 部署 BMIC (奖励代币)
    const BMICTokenFactory = await ethers.getContractFactory("BMICToken");
    rewardToken = await BMICTokenFactory.deploy();
    await rewardToken.waitForDeployment();

    // 3. 部署挖矿池
    const MiningPoolFactory = await ethers.getContractFactory("MiningPool");
    // 传入: 质押币(lpToken)地址, 奖励币(rewardToken)地址
    pool = await MiningPoolFactory.deploy(lpToken.target, rewardToken.target);
    await pool.waitForDeployment();

    // --- 准备工作 ---
    // A. 给用户发点 LP Token 用来质押 (1000 LP)
    await lpToken.mint(user1.address, ethers.parseUnits("1000", 18));
    
    // B. 给矿池充值 BMIC (老板自己转账进去，修正了这里！)
    await rewardToken.transfer(pool.target, ethers.parseUnits("1000000", 18));
  });

  it("核心流程：质押 -> 时间流逝 -> 领取奖励", async function () {
    // 1. 设置挖矿速率 (管理员操作)
    // 假设每秒产出 1 个 BMIC，持续 10天 (864000秒)
    const rewardRate = ethers.parseUnits("1", 18);
    const duration = 86400 * 10;
    await pool.setRewardsDuration(rewardRate, duration);

    // 2. 用户质押 (Stake)
    const stakeAmount = ethers.parseUnits("100", 18);
    // 先授权
    await lpToken.connect(user1).approve(pool.target, stakeAmount);
    // 再质押
    await pool.connect(user1).stake(stakeAmount);
    console.log("✅ 用户质押了 100 LP");

    // 3. 验证此时奖励应该为 0 (刚质押还没过时间)
    expect(await pool.earned(user1.address)).to.equal(0);

    // --- ⏰ 开启时间加速魔法 ---
    // 让区块链时间快进 100 秒
    await time.increase(100);
    console.log("⏳ 时间向后快进了 100 秒...");

    // 4. 检查收益
    // 理论上：1秒产1个币，100秒应该有约 100个币
    const earned = await pool.earned(user1.address);
    console.log("💰 用户当前的待领取收益:", ethers.formatUnits(earned, 18));
    
    // 只要收益大于 99 就算对 (允许微小的时间误差)
    expect(earned).to.be.gt(ethers.parseUnits("99", 18));

    // 5. 领取奖励 (Get Reward)
    const balanceBefore = await rewardToken.balanceOf(user1.address);
    await pool.connect(user1).getReward();
    const balanceAfter = await rewardToken.balanceOf(user1.address);

    expect(balanceAfter - balanceBefore).to.be.closeTo(earned, ethers.parseUnits("1", 18));
    console.log("✅ 用户成功提取了收益进钱包");

    // 6. 提现本金 (Withdraw)
    await pool.connect(user1).withdraw(stakeAmount);
    expect(await lpToken.balanceOf(user1.address)).to.equal(ethers.parseUnits("1000", 18));
    console.log("✅ 用户成功赎回了本金");
  });
});