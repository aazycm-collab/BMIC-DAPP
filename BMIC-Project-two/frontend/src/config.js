import { parseAbi } from 'viem';

// --- 1. 新合约地址 (2026-01-15 部署) ---
export const GENESIS_NFT_ADDRESS = "0x38466874428706ae7Ff9E5c2118664d8494521cA";
export const USDT_ADDRESS = "0x92ff6934d556EB5162415395ab528B05D28b95F4";
export const MINING_POOL_ADDRESS = "0x6B2bDdB91BA1bffD9f28021A5c102657DF00Dac5";
export const BMIC_ADDRESS = "0x467CCf27b837BC0f0c2F5c51f34f5f226741ab52";

// --- 2. ABI 说明书 ---
export const NFT_ABI = parseAbi([
  "function mint(address referrer) external",
  "function totalSupply() view returns (uint256)",
  "function hasMinted(address) view returns (bool)",
  "function referrers(address) view returns (address)" // 新增：读取上级
]);

export const USDT_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
]);

export const MINING_ABI = parseAbi([
  "function rewardPerToken() view returns (uint256)",
  "function earned(address account) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getReward() external"
]);