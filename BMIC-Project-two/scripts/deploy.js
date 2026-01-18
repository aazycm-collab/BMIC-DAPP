const hre = require("hardhat");
require("dotenv").config(); // 确保能读取 .env

async function main() {
  console.log("🚀 开始部署 BMIC 项目 (配置化版)...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👨‍💻 部署者地址:", deployer.address);

  // --- 1. 读取并检查环境配置 ---
  const fundWallet = process.env.FUND_WALLET_ADDR;
  const teamWallet = process.env.TEAM_WALLET_ADDR;

  if (!fundWallet || !teamWallet) {
    console.error("❌ 错误: 请先在 .env 文件中配置 FUND_WALLET_ADDR 和 TEAM_WALLET_ADDR");
    process.exit(1);
  }

  console.log("\n📋 配置检查:");
  console.log("   - 金库钱包 (60%):", fundWallet);
  console.log("   - 运营钱包 (30%):", teamWallet);

  // --- 2. 部署 BMIC Token ---
  console.log("\nDeploying BMICToken...");
  const BMICToken = await hre.ethers.getContractFactory("BMICToken");
  const bmic = await BMICToken.deploy();
  await bmic.waitForDeployment();
  console.log("✅ BMICToken 部署成功:", bmic.target);

  // --- 3. 部署 MockUSDT ---
  console.log("\nDeploying MockUSDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  console.log("✅ MockUSDT 部署成功:", usdt.target);

  // --- 4. 部署 GenesisNFT (使用配置的地址) ---
  console.log("\nDeploying GenesisNFT...");
  const GenesisNFT = await hre.ethers.getContractFactory("GenesisNFT");
  // 参数: USDT地址, 金库地址(.env), 团队地址(.env)
  const nft = await GenesisNFT.deploy(usdt.target, fundWallet, teamWallet);
  await nft.waitForDeployment();
  console.log("✅ GenesisNFT 部署成功:", nft.target);

  // --- 5. 部署 MiningPool ---
  console.log("\nDeploying MiningPool...");
  const MiningPool = await hre.ethers.getContractFactory("MiningPool");
  const pool = await MiningPool.deploy(usdt.target, bmic.target);
  await pool.waitForDeployment();
  console.log("✅ MiningPool 部署成功:", pool.target);

  // --- 6. 初始化 ---
  console.log("\n正在进行初始化设置...");
  
  // 给部署者印 10,000 U 方便测试
  await usdt.mint(deployer.address, hre.ethers.parseUnits("10000", 18));
  console.log("💰 已给部署者铸造 10,000 MockUSDT");

  // 给矿池注入 100万 BMIC
  await bmic.transfer(pool.target, hre.ethers.parseUnits("1000000", 18));
  console.log("💰 已向矿池注入 1,000,000 BMIC 奖励");

  console.log("\n🎉 全部部署完毕！请务必更新前端 config.js 的地址！");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});