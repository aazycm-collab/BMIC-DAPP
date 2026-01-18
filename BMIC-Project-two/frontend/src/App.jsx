import { useState, useEffect } from 'react';
import { ConnectButton, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import LoginGate from './LoginGate';
import MintCard from './MintCard';
import { NFTBenefits, EarningsWallet, CommunityNode, ReferralTools } from './DashboardComponents';
import { translations } from './translations';

import AppLogo from './AppLogo.png';

function App() {
  const { address } = useAccount();
  const [lang, setLang] = useState('zh');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = translations[lang];
  const [activeReferrer, setActiveReferrer] = useState(null);

  useEffect(() => { setActiveReferrer(null); }, [address]);
  const handleLangSelect = (l) => { setLang(l); setIsLangMenuOpen(false); };

  // 🟢 1. 定义国旗映射表
  const flagMap = {
    en: '🇺🇸',
    zh: '🇨🇳',
    ko: '🇰🇷',
    ja: '🇯🇵'
  };

  const dropdownStyle = {
    position: 'absolute', top: '100%', right: 0, marginTop: '10px',
    background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)',
    borderRadius: '12px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px',
    backdropFilter: 'blur(12px)', minWidth: '120px', zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  };

  const dropdownItemStyle = (key) => ({
    padding: '10px 12px', background: lang === key ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    color: lang === key ? '#60a5fa' : '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer',
    textAlign: 'left', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: lang === key ? 'bold' : 'normal'
  });

  // 钱包按钮样式 (保持之前的优化)
  const walletBtnStyle = {
    height: '34px',
    padding: '0 14px',
    fontSize: '0.9rem',
    borderRadius: '12px',
    background: 'rgba(30, 41, 59, 0.6)', 
    border: '1px solid rgba(56, 189, 248, 0.3)', 
    color: '#38bdf8',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    gap: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transform: 'scale(0.9)', 
    transformOrigin: 'right center',
    willChange: 'transform'
  };

  // 🟢 2. 新增：语言按钮样式 (让它看起来和钱包按钮风格一致)
  const langBtnStyle = {
    height: '34px', // 高度与钱包按钮对齐
    padding: '0 10px',
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    // 同样应用缩放，保持视觉协调
    transform: 'scale(0.9)', 
    transformOrigin: 'right center',
    transition: 'background 0.2s'
  };

  return (
    <RainbowKitProvider>
      <div style={{ 
        height: '100vh', width: '100vw', 
        background: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 40%, #020617 100%)', 
        overflowY: 'auto', position: 'relative' 
      }}>
        
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '90vw', maxWidth: '600px', opacity: 0.06, pointerEvents: 'none', zIndex: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <img src={AppLogo} alt="Background" style={{ width: '100%', filter: 'blur(3px) drop-shadow(0 0 80px #3b82f6)' }} />
        </div>

        {/* 顶部导航 */}
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, padding: '0 24px', 
          background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(16px)', zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
          height: '70px' 
        }}>
          <div style={{ fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center' }}>
            <img 
              src={AppLogo} 
              alt="Logo" 
              style={{ height: '42px', width: '42px', borderRadius: '50%', marginRight: '12px', boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }} 
            />
            <span style={{ fontSize: '1.25rem', letterSpacing: '1px' }}>BMIC</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return ( <button onClick={openConnectModal} style={walletBtnStyle}>Connect</button> );
                      }
                      if (chain.unsupported) {
                        return ( <button onClick={openAccountModal} style={{...walletBtnStyle, color: '#ef4444', borderColor: '#ef4444'}}>Wrong Net</button> );
                      }
                      const addr = account.address;
                      const formattedAddress = addr ? `${addr.slice(0, 2)}...${addr.slice(-4)}` : '';
                      return (
                        <button onClick={openAccountModal} style={walletBtnStyle}>
                          <div style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />
                          {formattedAddress}
                        </button>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
            
            {/* 🟢 3. 修改此处：使用国旗图标替代文字 */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                style={langBtnStyle} // 应用新样式
              >
                {/* 显示国旗，稍微加大字体 */}
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{flagMap[lang]}</span>
                {/* 下拉箭头 */}
                <span style={{ fontSize: '0.6rem', opacity: 0.6, marginLeft: '2px' }}>▼</span>
              </button>

              {isLangMenuOpen && (
                <div style={dropdownStyle}>
                  {['en','zh','ko','ja'].map(k => (
                    <button key={k} onClick={() => handleLangSelect(k)} style={dropdownItemStyle(k)}>
                      <span style={{ fontSize: '1.2rem' }}>{flagMap[k]}</span> 
                      {{en:'English',zh:'中文',ko:'한국어',ja:'日本語'}[k]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <LoginGate key={address} onReferrerSet={(ref) => setActiveReferrer(ref)} t={t}>
          <div 
            onClick={() => setIsLangMenuOpen(false)}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', 
              paddingTop: '70px', 
              paddingBottom: '100px', 
              boxSizing: 'border-box',
              width: '100%',
              paddingLeft: '20px', paddingRight: '20px',
              color: 'white', fontFamily: "'Inter', sans-serif",
              position: 'relative', zIndex: 1, minHeight: '100vh'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%', maxWidth: '420px' }}>
              <MintCard referrerAddress={activeReferrer} t={t} />
              <NFTBenefits t={t} />
              <EarningsWallet t={t} />
              <CommunityNode t={t} />
              <ReferralTools t={t} />
              <div style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px dashed rgba(148, 163, 184, 0.3)', color: '#94a3b8', textAlign: 'center', background: 'rgba(30, 41, 59, 0.3)' }}>
                ⛏️ {t.mining_soon}
              </div>
            </div>
          </div>
        </LoginGate>
      </div>
    </RainbowKitProvider>
  );
}

export default App;