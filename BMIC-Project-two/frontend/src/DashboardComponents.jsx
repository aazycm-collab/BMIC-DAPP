import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';

const fetchUserData = async (address) => {
  if (!address) return null;
  try {
    const response = await fetch(`http://localhost:3001/api/user/${address}`);
    return response.json();
  } catch (e) { return null; }
};

// 格式化时间的辅助函数
const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// --- 组件 1: NFT权益 (🟢 修复排版) ---
export function NFTBenefits({ t }) {
  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>✨ {t.nft_benefits_title}</h3>
      
      {/* 空投高亮区 */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)', padding: '15px', borderRadius: '12px', marginBottom: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{t.airdrop_tag}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{t.airdrop_val}</div>
        </div>
        
        {/* 🟢 优化点：去掉 maxWidth 限制，让文字自然伸展，且字体稍微调大一点点方便阅读 */}
        <div style={{ fontSize: '0.8rem', textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
          {t.airdrop_rule}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <BenefitRow icon="🆔" text={t.benefit_1} />
        <BenefitRow icon="🎁" text={t.benefit_2} />
        <BenefitRow icon="💰" text={t.benefit_3} />
        <BenefitRow icon="📢" text={t.benefit_4} />
        <BenefitRow icon="⛏️" text={t.benefit_5} />
        <BenefitRow icon="🤝" text={t.benefit_6} />
      </div>
    </div>
  );
}

function BenefitRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1', alignItems: 'center', background: '#0f172a', padding: '8px', borderRadius: '6px' }}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

// --- 组件 2: 收益钱包 (不变) ---
export function EarningsWallet({ t }) {
  const { address } = useAccount();
  const { data } = useQuery({
    queryKey: ['userData', address],
    queryFn: () => fetchUserData(address),
    enabled: !!address,
    refetchInterval: 5000,
  });

  const directCount = data?.directCount || 0;
  const totalDirectRewards = directCount * 20; 
  const pendingDividends = "Phase 2";

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>💰 {t.earnings_title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={statBoxStyle}>
          <div style={labelStyle}>{t.direct_rewards}</div>
          <div style={valueStyle(true)}>{totalDirectRewards} USDT</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '5px' }}>({directCount} invites)</div>
        </div>
        <div style={statBoxStyle}>
          <div style={labelStyle}>{t.pending_div}</div>
          <div style={{...valueStyle(false), fontSize: '0.9rem', color: '#94a3b8'}}>{pendingDividends}</div>
        </div>
      </div>
    </div>
  );
}

// --- 组件 3: 社区节点 (不变) ---
export function CommunityNode({ t }) {
  const { address } = useAccount();
  const { data } = useQuery({
    queryKey: ['userData', address],
    queryFn: () => fetchUserData(address),
    enabled: !!address,
    refetchInterval: 5000, 
  });

  const currentTier = data?.tier || "V0";
  const totalSales = data?.totalSales || 0;
  const smallArea = data?.smallArea || 0; 
  const referrer = data?.referrer || "None";

  let poolWeight = "0%";
  let nextTarget = 20;
  let nextTierName = "V2";

  if (currentTier === "V1") { poolWeight = "0%"; nextTarget = 20; nextTierName = "V2"; }
  else if (currentTier === "V2") { poolWeight = "40%"; nextTarget = 50; nextTierName = "V3"; }
  else if (currentTier === "V3") { poolWeight = "30%"; nextTarget = 100; nextTierName = "V4"; }
  else if (currentTier === "V4") { poolWeight = "20%"; nextTarget = 200; nextTierName = "V5"; }
  else if (currentTier === "V5") { poolWeight = "10%"; nextTarget = 99999; nextTierName = "Max"; }
  else { poolWeight = "0%"; nextTarget = 20; } 

  const progress = Math.min((smallArea / nextTarget) * 100, 100);

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>🏆 {t.community_node}</h3>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '15px', background: '#0f172a', padding: '8px', borderRadius: '6px' }}>
        {t.my_referrer}: <span style={{ color: '#cbd5e1' }}>{referrer === "None" ? "No Upline" : `${referrer.slice(0,6)}...${referrer.slice(-4)}`}</span>
      </div>
      <div style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', padding: '15px', borderRadius: '12px', marginBottom: '20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t.current_tier}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{currentTier}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t.tier_benefit}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{poolWeight}</div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <span>{t.small_leg} Progress ({nextTierName})</span>
          <span>{smallArea} / {currentTier === "V5" ? "Max" : nextTarget}</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: '#334155', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#10b981', transition: 'width 0.5s ease' }} />
        </div>
        {currentTier !== "V5" && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
            {t.next_level_tip}: {Math.max(nextTarget - smallArea, 0)}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={miniStatStyle}>
          <span>{t.team_sales}</span>
          <strong>{totalSales}</strong>
        </div>
        <div style={miniStatStyle}>
          <span>{t.small_leg}</span>
          <strong style={{ color: '#facc15' }}>{smallArea}</strong>
        </div>
      </div>
    </div>
  );
}

// --- 组件 4: 邀请工具箱 (🟢 增加时间列) ---
export function ReferralTools({ t }) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data: directs } = useQuery({
    queryKey: ['referrals', address],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/referrals/${address}`);
      return res.json();
    },
    enabled: !!address,
    refetchInterval: 5000,
  });

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${address}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={cardStyle}>
      <h3 style={headerStyle}>📣 {t.invite_tools}</h3>
      <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', wordBreak: 'break-all', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px', fontFamily: 'monospace' }}>
        {inviteLink || "Please connect wallet"}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleCopy} style={btnStyle('#3b82f6')}>
          {copied ? "✅ Copied" : t.copy_link}
        </button>
        <button onClick={() => setShowQR(!showQR)} style={btnStyle('#f59e0b')}>
          {showQR ? "Close QR" : "QR Poster"}
        </button>
      </div>
      {showQR && address && (
        <div style={{ marginBottom: '20px', textAlign: 'center', background: 'white', padding: '20px', borderRadius: '12px' }}>
          <QRCodeSVG value={inviteLink} size={150} />
          <p style={{ color: 'black', marginTop: '10px', fontWeight: 'bold' }}>Scan to Join BMIC</p>
        </div>
      )}
      
      <div style={{ borderTop: '1px solid #334155', paddingTop: '15px' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>{t.my_referral} ({directs?.length || 0})</h4>
        
        {/* 🟢 修改表头：增加时间列，调整比例 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 1fr 1fr 1fr', fontSize: '0.75rem', color: '#94a3b8', paddingBottom: '8px', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          <div style={{ textAlign: 'left' }}>{t.th_addr || "Addr"}</div>
          <div>{t.th_date || "Date"}</div>
          <div>{t.th_status || "NFT"}</div>
          <div>{t.th_team || "Team"}</div>
          <div>{t.th_sales || "Total"}</div>
        </div>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {directs && directs.length > 0 ? (
            directs.map((d, index) => (
              // 🟢 修改行数据：增加时间列
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 1fr 1fr 1fr', fontSize: '0.75rem', padding: '8px 0', borderBottom: '1px solid #1e293b', alignItems: 'center', textAlign: 'center', color: '#cbd5e1' }}>
                <div style={{ textAlign: 'left', fontFamily: 'monospace' }}>{d.address.slice(0,4)}...{d.address.slice(-4)}</div>
                <div style={{ color: '#94a3b8' }}>{formatDate(d.registerTime)}</div>
                <div style={{ color: d.hasMinted ? '#4ade80' : '#94a3b8' }}>{d.hasMinted ? "✅" : "No"}</div>
                <div>{d.teamCount}</div>
                <div style={{ fontWeight: 'bold', color: '#facc15' }}>{d.nftTotal}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>No Data</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 样式定义 ---
const cardStyle = {
  background: '#1e293b', padding: '25px', borderRadius: '20px', 
  border: '1px solid #334155', maxWidth: '400px', width: '100%', 
  color: 'white', marginTop: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
};
const headerStyle = { borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '15px' };
const statBoxStyle = { background: '#0f172a', padding: '15px', borderRadius: '12px' };
const labelStyle = { color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' };
const valueStyle = (isGold) => ({ fontSize: '1.2rem', fontWeight: 'bold', color: isGold ? '#facc15' : 'white' });
const miniStatStyle = { background: '#2c2e33', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: '#94a3b8' };
const btnStyle = (color) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: color, color: 'white', fontWeight: 'bold', cursor: 'pointer' });