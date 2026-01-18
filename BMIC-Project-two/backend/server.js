// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { ethers } = require('ethers');
// const fs = require('fs');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // --- 配置信息 ---
// const NFT_ADDRESS = "0x38466874428706ae7Ff9E5c2118664d8494521cA";
// const NFT_ABI = ["event NFTMinted(address indexed user, uint256 tokenId, address referrer)"];
// const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

// // --- 数据库 ---
// const DB_FILE = './database.json';
// let database = {};

// if (fs.existsSync(DB_FILE)) {
//   try {
//     database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
//     console.log("📂 已加载历史数据");
//   } catch (e) { console.log("⚠️ 数据重置"); }
// }

// function saveDB() {
//   fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
// }

// function initUser(addr) {
//   if (!database[addr]) {
//     database[addr] = {
//       address: addr,
//       referrer: null,
//       tier: "V1",      // 🟢 修正点1: 只要入单，默认就是 V1
//       directCount: 0,
//       totalSales: 0, 
//       legs: {},        
//       maxLeg: 0,
//       smallArea: 0,    
//       directs: []
//     };
//   }
//   return database[addr];
// }

// // --- 🌟 核心算法：V2-V5 晋升逻辑 ---
// function updateStats(uplineAddr, sourceLegAddr) {
//   let upline = database[uplineAddr];
//   if (!upline) return;

//   // 1. 增加业绩
//   upline.totalSales += 1;
//   if (!upline.legs[sourceLegAddr]) upline.legs[sourceLegAddr] = 0;
//   upline.legs[sourceLegAddr] += 1;

//   // 2. 计算大小区
//   let max = 0;
//   for (let leg in upline.legs) {
//     if (upline.legs[leg] > max) max = upline.legs[leg];
//   }
//   upline.maxLeg = max;
//   upline.smallArea = upline.totalSales - max; // 小区 = 总 - 大

//   // 3. 🟢 修正点2: 严格按照你的新制度判断等级
//   let oldTier = upline.tier;
//   const sa = upline.smallArea;

//   if (sa >= 200) {
//     upline.tier = "V5";
//   } else if (sa >= 100) {
//     upline.tier = "V4";
//   } else if (sa >= 50) {
//     upline.tier = "V3";
//   } else if (sa >= 20) {
//     upline.tier = "V2";
//   } else {
//     upline.tier = "V1"; // 默认 V1
//   } // V1 权重 0%, 只有 V1 身份

//   if (upline.tier !== oldTier) {
//     console.log(`   🚀 [升级] ${uplineAddr} -> ${upline.tier} (小区: ${sa})`);
//   }

//   // 4. 向上汇报
//   if (upline.referrer && upline.referrer !== ethers.ZeroAddress) {
//     updateStats(upline.referrer, upline.address);
//   }
// }

// // --- 监听器 ---
// console.log("🎧 制度已更新: V1起步, V2(20)-V5(200)");

// nftContract.on("NFTMinted", (user, tokenId, referrer, event) => {
//   console.log(`\n🔔 新铸造! ${user}`);

//   initUser(user); // 这里会将其设为 V1
//   database[user].referrer = referrer;

//   if (referrer && referrer !== ethers.ZeroAddress) {
//     const refData = initUser(referrer);
//     refData.directCount += 1;
//     refData.directs.push(user);
//     updateStats(referrer, user);
//     console.log(`   ✅ 业绩结算完成`);
//   }
//   saveDB();
// });

// // --- API ---
// app.get('/api/user/:address', (req, res) => {
//   const data = database[req.params.address] || { tier: "V0", totalSales: 0, maxLeg: 0, smallArea: 0, directCount: 0 };
//   res.json(data);
// });

// app.get('/api/referrals/:address', (req, res) => {
//   const user = database[req.params.address];
//   if (!user) return res.json([]);
//   const fullStats = user.directs.map(childAddr => {
//     const childData = database[childAddr];
//     return {
//       address: childAddr,
//       hasMinted: true, 
//       teamCount: childData ? childData.totalSales : 0, 
//       nftTotal: childData ? childData.totalSales : 0 
//     };
//   });
//   res.json(fullStats);
// });

// app.listen(3001, () => {
//   console.log(`🚀 后端运行中: http://localhost:3001`);
// });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// --- 配置信息 ---
const NFT_ADDRESS = "0x38466874428706ae7Ff9E5c2118664d8494521cA";
const NFT_ABI = ["event NFTMinted(address indexed user, uint256 tokenId, address referrer)"];
const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

// --- 数据库 ---
const DB_FILE = './database.json';
let database = {};

if (fs.existsSync(DB_FILE)) {
  try {
    database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    console.log("📂 已加载历史数据");
  } catch (e) { console.log("⚠️ 数据重置"); }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
}

function initUser(addr) {
  if (!database[addr]) {
    database[addr] = {
      address: addr,
      referrer: null,
      tier: "V1",
      directCount: 0,
      totalSales: 0, 
      legs: {},        
      maxLeg: 0,
      smallArea: 0,    
      directs: [],
      // 🟢 新增：记录注册时间 (如果没有，就存当前时间)
      registerTime: Date.now() 
    };
  }
  return database[addr];
}

// --- V2-V5 晋升逻辑 (保持不变) ---
function updateStats(uplineAddr, sourceLegAddr) {
  let upline = database[uplineAddr];
  if (!upline) return;

  upline.totalSales += 1;
  if (!upline.legs[sourceLegAddr]) upline.legs[sourceLegAddr] = 0;
  upline.legs[sourceLegAddr] += 1;

  let max = 0;
  for (let leg in upline.legs) {
    if (upline.legs[leg] > max) max = upline.legs[leg];
  }
  upline.maxLeg = max;
  upline.smallArea = upline.totalSales - max;

  const sa = upline.smallArea;
  if (sa >= 200) upline.tier = "V5";
  else if (sa >= 100) upline.tier = "V4";
  else if (sa >= 50) upline.tier = "V3";
  else if (sa >= 20) upline.tier = "V2";
  else upline.tier = "V1";

  if (upline.referrer && upline.referrer !== ethers.ZeroAddress) {
    updateStats(upline.referrer, upline.address);
  }
}

// --- 监听器 ---
console.log("🎧 监听中... (含时间戳记录)");

nftContract.on("NFTMinted", (user, tokenId, referrer, event) => {
  console.log(`\n🔔 新铸造! ${user}`);

  initUser(user); 
  // 强制更新一下新用户的时间（确保是 Mint 的这一刻）
  database[user].registerTime = Date.now();
  database[user].referrer = referrer;

  if (referrer && referrer !== ethers.ZeroAddress) {
    const refData = initUser(referrer);
    refData.directCount += 1;
    refData.directs.push(user);
    updateStats(referrer, user);
  }
  saveDB();
});

// --- API ---
app.get('/api/user/:address', (req, res) => {
  const data = database[req.params.address] || { tier: "V0", totalSales: 0, maxLeg: 0, smallArea: 0, directCount: 0 };
  res.json(data);
});

app.get('/api/referrals/:address', (req, res) => {
  const user = database[req.params.address];
  if (!user) return res.json([]);
  
  const fullStats = user.directs.map(childAddr => {
    const childData = database[childAddr];
    return {
      address: childAddr,
      hasMinted: true, 
      teamCount: childData ? childData.totalSales : 0, 
      nftTotal: childData ? childData.totalSales : 0,
      // 🟢 新增：返回注册时间
      registerTime: childData ? childData.registerTime : 0 
    };
  });
  
  // 按时间倒序排列（新注册的在前面）
  fullStats.sort((a, b) => b.registerTime - a.registerTime);
  
  res.json(fullStats);
});

app.listen(3001, () => {
  console.log(`🚀 后端运行中: http://localhost:3001`);
});