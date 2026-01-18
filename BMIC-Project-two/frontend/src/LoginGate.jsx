import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

import AppLogo from './AppLogo.png';

const checkUserExists = async (address) => {
  try {
    const res = await fetch(`http://localhost:3001/api/user/${address}`);
    const data = await res.json();
    return data && data.referrer && data.referrer !== "0x0000000000000000000000000000000000000000";
  } catch (e) {
    return false;
  }
};

export default function LoginGate({ onReferrerSet, t, children }) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [referrerInput, setReferrerInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam && refParam.startsWith('0x') && refParam.length === 42) {
      setReferrerInput(refParam);
    }
  }, []);

  const handleLogin = async () => {
    if (!isConnected) { openConnectModal(); return; }
    setLoading(true);
    try {
      const message = `Welcome to BMIC DApp!\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      await signMessageAsync({ message });
      const registered = await checkUserExists(address);
      setIsRegistered(registered);
      if (registered) onReferrerSet(null); 
      setIsSignedIn(true);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBind = async () => {
    if (!referrerInput || referrerInput.length !== 42 || !referrerInput.startsWith('0x')) {
      alert("Please enter a valid wallet address!");
      return;
    }
    if (referrerInput.toLowerCase() === address.toLowerCase()) {
      alert("You cannot invite yourself!");
      return;
    }
    onReferrerSet(referrerInput);
    setIsRegistered(true);
  };

  // 1. 未连接钱包
  if (!isConnected) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: 'white', position: 'relative', zIndex: 10, padding: '20px' }}>
        <img src={AppLogo} style={{ width: '90px', borderRadius:'50%', marginBottom:'25px', boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)' }} />
        <h1 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', fontWeight:'800', letterSpacing:'-1px' }}>BMIC</h1>
        <p style={{ marginBottom: '40px', color: '#64748b', fontSize:'0.95rem' }}>Web3 Infinite Marketing</p>
        <button onClick={openConnectModal} style={{ padding: '14px 36px', fontSize: '1.05rem', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(6, 182, 212, 0.25)' }}>
          {t?.connect_wallet || "Connect Wallet"}
        </button>
      </div>
    );
  }

  // 2. 已连接但未签名
  if (!isSignedIn) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: 'white', position: 'relative', zIndex: 10, padding: '20px' }}>
        
        <div style={{ textAlign: 'center', marginTop: '-40px' }}>
          <img src={AppLogo} style={{ width: '70px', borderRadius:'50%', marginBottom:'20px', filter:'grayscale(0.3)' }} />
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 30px 0', fontWeight:'600' }}>{t.welcome_back}</h2>
          
          <button 
            onClick={handleLogin}
            disabled={loading}
            style={{ 
              padding: '12px 36px', background: '#10b981', color: 'white', 
              border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)', minWidth: '160px'
            }}
          >
            {loading ? t.verifying : t.sign_btn}
          </button>
        </div>

        {/* 🟢 提示消息沉底 */}
        <p style={{ 
          position: 'absolute', bottom: '60px', 
          color: '#475569', fontSize: '0.85rem', 
          textAlign: 'center', width: '100%', padding: '0 20px'
        }}>
          {t.sign_tip}
        </p>
      </div>
    );
  }

  // 3. 绑定推荐人
  if (isSignedIn && !isRegistered) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: 'white', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.8)', 
          backdropFilter: 'blur(20px)',
          padding: '30px 24px', // 内部留白
          borderRadius: '24px', 
          border: '1px solid rgba(148, 163, 184, 0.2)', 
          // 🟢 移动端适配关键：
          // 1. 默认占满减去两边 padding 的宽度 (calc(100% - 40px))
          // 2. 最大不超过 340px，保持小巧
          width: 'calc(100% - 40px)', 
          maxWidth: '340px', 
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#fff' }}>{t.bind_title}</h3>
          <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.85rem', lineHeight: '1.5' }}>
            {t.bind_desc}
          </p>
          
          <input 
            type="text" 
            placeholder={t.enter_placeholder}
            value={referrerInput}
            onChange={(e) => setReferrerInput(e.target.value)}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '14px', 
              border: '1px solid #475569', background: 'rgba(15, 23, 42, 0.6)', 
              color: 'white', marginBottom: '20px', fontSize: '0.85rem', outline: 'none',
              textAlign: 'center', boxSizing: 'border-box' // 确保输入框不撑破容器
            }}
          />
          
          <button 
            onClick={handleBind}
            style={{ 
              width: '100%', padding: '14px', background: '#3b82f6', 
              color: 'white', border: 'none', borderRadius: '14px', 
              cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'background 0.2s'
            }}
          >
            {t.confirm_bind}
          </button>
          
          <div 
             onClick={() => setReferrerInput("0x0000000000000000000000000000000000000000")}
             style={{ marginTop: '18px', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t.use_default}
          </div>
        </div>
      </div>
    );
  }

  return children;
}