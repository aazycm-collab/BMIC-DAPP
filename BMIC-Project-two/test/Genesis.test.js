const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BMIC Genesis NFT 系统测试", function () {
  let MockUSDT, usdt;
  let GenesisNFT, nft;
  let owner, user1, referrer, fundWallet, teamWallet;

  // 每次测试开始前，重新部署一套全新的环境
  beforeEach(async function () {
    // 1. 获取测试账号
    [owner, user1, referrer, fundWallet, teamWallet] = await ethers.getSigners();

    // 2. 部署假 USDT
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    usdt = await MockUSDTFactory.deploy();
    // 等待部署完成 (新版 ethers 写法)
    await usdt.waitForDeployment();

    // 3. 部署 NFT 合约
    const GenesisNFTFactory = await ethers.getContractFactory("GenesisNFT");
    // 传入参数：USDT地址, 金库地址, 团队地址
    nft = await GenesisNFTFactory.deploy(usdt.target, fundWallet.address, teamWallet.address);
    await nft.waitForDeployment();

    // 4. 给测试用户转点钱 (1000 USDT)
    const initAmount = ethers.parseUnits("1000", 18);
    await usdt.mint(user1.address, initAmount);
  });

  it("核心流程验证：购买 NFT 并自动分账", async function () {
    // --- 准备阶段 ---
    const price = ethers.parseUnits("200", 18); // 价格 200 U

    // 1. 用户必须先 Approve (授权) 合约扣款
    await usdt.connect(user1).approve(nft.target, price);

    // 记录购买前的余额，方便对比
    const fundBalanceBefore = await usdt.balanceOf(fundWallet.address);
    const teamBalanceBefore = await usdt.balanceOf(teamWallet.address);
    const refBalanceBefore  = await usdt.balanceOf(referrer.address);

    // --- 动作阶段 ---
    // 2. 用户执行 Mint (填入 referrer 作为推荐人)
    console.log("正在执行铸造...");
    await nft.connect(user1).mint(referrer.address);

    // --- 验尸阶段 (断言) ---
    // 检查用户是不是真的收到 NFT 了？
    expect(await nft.balanceOf(user1.address)).to.equal(1);
    console.log("✅ 用户成功收到 1 张 NFT");

    // 检查分账对不对？
    // 60% = 120 U
    const fundExpected = ethers.parseUnits("120", 18);
    const fundBalanceAfter = await usdt.balanceOf(fundWallet.address);
    expect(fundBalanceAfter - fundBalanceBefore).to.equal(fundExpected);
    console.log("✅ 金库钱包正确到账 120 U (60%)");

    // 30% = 60 U
    const teamExpected = ethers.parseUnits("60", 18);
    const teamBalanceAfter = await usdt.balanceOf(teamWallet.address);
    expect(teamBalanceAfter - teamBalanceBefore).to.equal(teamExpected);
    console.log("✅ 运营钱包正确到账 60 U (30%)");

    // 10% = 20 U
    const refExpected = ethers.parseUnits("20", 18);
    const refBalanceAfter = await usdt.balanceOf(referrer.address);
    expect(refBalanceAfter - refBalanceBefore).to.equal(refExpected);
    console.log("✅ 推荐人正确到账 20 U (10%)");
  });
});