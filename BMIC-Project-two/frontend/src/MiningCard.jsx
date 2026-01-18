import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { MINING_POOL_ADDRESS, USDT_ADDRESS, MINING_ABI, USDT_ABI } from './config';

export default function MiningCard() {
  const { address } = useAccount();
  
  // --- 读取数据 ---
  // 1. 用户已质押的数量
  const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
    address: MINING_POOL_ADDRESS, abi: MINING_ABI, functionName: 'balanceOf', args: [address], watch: true
  });

  // 2. 用户待领取的 BMIC 奖励
  const { data: earnedAmount, refetch: refetchEarned } = useReadContract({
    address: MINING_POOL_ADDRESS, abi: MINING_ABI, functionName: 'earned', args: [address], watch: true
  });

  // 3. 用户钱包里的 USDT 余额 (用于质押)
  const { data: usdtBalance, refetch: refetchUsdt } = useReadContract({
    address: USDT_ADDRESS, abi: USDT_ABI, functionName: 'balanceOf', args: [address], watch: true
  });

  // 4. 检查 USDT 对矿池的授权
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDT_ADDRESS, abi: USDT_ABI, functionName: 'allowance', args: [address, MINING_POOL_ADDRESS], watch: true
  });

  // --- 写入操作 ---
  // 我们使用同一个 hook 处理所有交易，因为同一时间通常只做一个操作
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // 交易成功后刷新所有数据
  useEffect(() => {
    if (isSuccess) {
      console.log("Mining Action Success!");
      refetchStaked();
      refetchEarned();
      refetchUsdt();
      refetchAllowance();
    }
  }, [isSuccess]);

  // --- 交互逻辑 ---
  const STAKE_AMOUNT = parseUnits("100", 18); // 简化测试：每次固定质押 100 U
  const needsApproval = allowance ? allowance < STAKE_AMOUNT : true;

  // A. 授权
  const handleApprove = () => {
    writeContract({
      address: USDT_ADDRESS, abi: USDT_ABI, functionName: 'approve', args: [MINING_POOL_ADDRESS, parseUnits("100000", 18)]
    });
  };

  // B. 质押
  const handleStake = () => {
    writeContract({
      address: MINING_POOL_ADDRESS, abi: MINING_ABI, functionName: 'stake', args: [STAKE_AMOUNT]
    });
  };

  // C. 提现 (赎回)
  const handleWithdraw = () => {
    if (!stakedBalance) return;
    writeContract({
      address: MINING_POOL_ADDRESS, abi: MINING_ABI, functionName: 'withdraw', args: [stakedBalance] // 全部赎回
    });
  };

  // D. 领取奖励
  const handleClaim = () => {
    writeContract({
      address: MINING_POOL_ADDRESS, abi: MINING_ABI, functionName: 'getReward', args: []
    });
  };

  return (
    <div style={{ 
      background: '#1a1b1e', 
      padding: '25px', 
      borderRadius: '24px', 
      border: '1px solid #4ade80', // 绿色边框代表挖矿
      maxWidth: '400px',
      width: '100%',
      marginTop: '20px',
      color: 'white',
      boxShadow: '0 10px 30px rgba(74, 222, 128, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>⛏️ 流动性挖矿</h2>
        <span style={{ fontSize: '0.8rem', background: '#4ade80', color: '#064e3b', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>APY 365%</span>
      </div>

      {/* 状态提示 */}
      <div style={{ height: '30px', marginBottom: '10px', textAlign: 'center', fontSize: '0.9rem' }}>
        {isConfirming && <span style={{ color: '#facc15' }}>⏳ 链上确认中...</span>}
        {isSuccess && <span style={{ color: '#4ade80' }}>✅ 操作成功！数据已更新</span>}
        {error && <span style={{ color: '#ef4444' }}>❌ {(error.shortMessage || "操作失败")}</span>}
      </div>

      {/* 数据展示区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        {/* 左边：质押本金 */}
        <div style={{ background: '#2c2e33', padding: '15px', borderRadius: '16px' }}>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '5px' }}>我的质押 (USDT)</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white' }}>
            {stakedBalance ? formatUnits(stakedBalance, 18) : '0'}
          </div>
        </div>
        {/* 右边：待领收益 */}
        <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
          <div style={{ color: '#facc15', fontSize: '0.8rem', marginBottom: '5px' }}>待领取 (BMIC)</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#facc15' }}>
            {earnedAmount ? parseFloat(formatUnits(earnedAmount, 18)).toFixed(4) : '0.0000'}
          </div>
        </div>
      </div>

      {/* 操作按钮区 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* 1. 质押逻辑 */}
        {needsApproval ? (
          <button onClick={handleApprove} disabled={isPending || isConfirming} style={btnStyle('#f59e0b')}>
            {isPending ? '钱包签名中...' : '🔓 1. 授权矿池 (Approve)'}
          </button>
        ) : (
          <button onClick={handleStake} disabled={isPending || isConfirming} style={btnStyle('#3b82f6')}>
            {isPending ? '钱包签名中...' : '📥 2. 质押 100 USDT'}
          </button>
        )}

        {/* 2. 领取奖励 */}
        <button 
          onClick={handleClaim} 
          disabled={isPending || isConfirming || !earnedAmount || earnedAmount == 0} 
          style={{ ...btnStyle('#10b981'), opacity: (!earnedAmount || earnedAmount == 0) ? 0.5 : 1 }}
        >
          💰 领取收益 (Claim)
        </button>

        {/* 3. 提现 */}
        <button 
          onClick={handleWithdraw} 
          disabled={isPending || isConfirming || !stakedBalance || stakedBalance == 0} 
          style={{ ...btnStyle('#ef4444'), opacity: (!stakedBalance || stakedBalance == 0) ? 0.5 : 1 }}
        >
          📤 赎回本金 (Withdraw)
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '10px' }}>
        钱包余额: {usdtBalance ? parseFloat(formatUnits(usdtBalance, 18)).toFixed(2) : '0'} USDT
      </div>
    </div>
  );
}

// 按钮样式
const btnStyle = (color) => ({
  padding: '14px',
  borderRadius: '12px',
  border: 'none',
  background: color,
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});