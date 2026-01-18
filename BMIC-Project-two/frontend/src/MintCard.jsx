// import { useState, useEffect } from 'react';
// import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
// import { parseUnits } from 'viem';
// import { GENESIS_NFT_ADDRESS, USDT_ADDRESS, NFT_ABI, USDT_ABI } from './config';
// import GenesisNFT from './BMIC-NFT.jpg';

// export default function MintCard({ referrerAddress, t }) {
//   const { address } = useAccount();
//   const finalReferrer = referrerAddress || "0x0000000000000000000000000000000000000000";
//   const text = t || {}; 

//   const [isAutoMinting, setIsAutoMinting] = useState(false);

//   const { data: totalSupply, refetch: refetchSupply } = useReadContract({
//     address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'totalSupply', args: [], watch: true
//   });

//   const { data: allowance, refetch: refetchAllowance } = useReadContract({
//     address: USDT_ADDRESS, abi: USDT_ABI, functionName: 'allowance', args: [address, GENESIS_NFT_ADDRESS], watch: true
//   });

//   const { data: hasMinted, refetch: refetchHasMinted } = useReadContract({
//     address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'hasMinted', args: [address], watch: true
//   });

//   const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
//   const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

//   const { writeContract: writeMint, data: mintHash, isPending: isMintPending, error: mintError } = useWriteContract();
//   const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });

//   useEffect(() => { 
//     if (isApproveSuccess && isAutoMinting) {
//       refetchAllowance();
//       writeMint({ address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'mint', args: [finalReferrer] });
//       setIsAutoMinting(false);
//     }
//   }, [isApproveSuccess, isAutoMinting, finalReferrer, writeMint, refetchAllowance]);

//   useEffect(() => { 
//     if (isMintSuccess) { refetchSupply(); refetchHasMinted(); refetchAllowance(); } 
//   }, [isMintSuccess]);

//   useEffect(() => { if (mintError) setIsAutoMinting(false); }, [mintError]);

//   const PRICE_VAL = parseUnits("200", 18); 
//   const isOwned = hasMinted === true;
//   const needsApproval = allowance ? allowance < PRICE_VAL : true; 

//   const handleApprove = () => {
//     setIsAutoMinting(true);
//     writeApprove({ address: USDT_ADDRESS, abi: USDT_ABI, functionName: 'approve', args: [GENESIS_NFT_ADDRESS, PRICE_VAL] });
//   };

//   const handleMint = () => {
//     writeMint({ address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'mint', args: [finalReferrer] });
//   };

//   // 🟢 重点修改：调整样式以衔接顶部导航栏
//   const cardStyle = {
//     background: 'rgba(15, 23, 42, 0.6)', 
//     backdropFilter: 'blur(12px)',
//     padding: '24px', 
//     // 🟢 修改1：顶部直角，底部圆角
//     borderRadius: '0 0 24px 24px', 
//     // 🟢 修改2：去掉上边框，让它看起来是导航栏的延伸
//     border: '1px solid rgba(56, 189, 248, 0.2)',
//     borderTop: 'none', 
//     maxWidth: '400px', 
//     width: '100%', 
//     marginTop: '0px', 
//     boxShadow: '0 0 40px rgba(6, 182, 212, 0.1)'
//   };

//   const headerBg = isOwned 
//     ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)' 
//     : 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%)';

//   return (
//     <div style={cardStyle}>
//       <div style={{ 
//         width: '100%',
//         minHeight: '180px',
//         background: headerBg, 
//         borderRadius: '16px', 
//         marginBottom: '20px', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center', 
//         position: 'relative', 
//         border: isOwned ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)', 
//         overflow: 'hidden' 
//       }}>
        
//         <img 
//           src={GenesisNFT} 
//           alt="BMIC Genesis NFT" 
//           style={{ 
//             width: '100%',    
//             height: 'auto',   
//             maxHeight: '300px', 
//             objectFit: 'cover', 
//             display: 'block',   
//             borderRadius: '16px', 
//             boxShadow: isOwned ? '0 0 30px rgba(16, 185, 129, 0.4)' : '0 0 30px rgba(6, 182, 212, 0.4)',
//           }} 
//         />
        
//         {isOwned && <div style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,0.95)', color:'#059669', fontSize:'0.75rem', padding:'6px 12px', borderRadius:'20px', fontWeight:'800', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>{text.activated || "ACTIVATED"}</div>}
//       </div>

//       <div style={{ marginBottom: '15px' }}>
//         <h2 style={{ fontSize: '1.8rem', margin: 0, background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{text.mint_title || "Genesis Mint"}</h2>
//         <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px', lineHeight: '1.5' }}>{text.mint_desc}</p>
//       </div>
      
//       <div style={{ marginBottom: '30px' }}>
//         <div style={{ width: '100%', height: '8px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
//           <div style={{ width: `${totalSupply ? (Number(totalSupply) / 6000) * 100 : 0}%`, height: '100%', background: isOwned ? '#10b981' : 'linear-gradient(90deg, #06b6d4, #3b82f6)', transition: 'width 0.5s ease', boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }} />
//         </div>
//         <div style={{ display:'flex', justifyContent:'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
//            <span>Progress</span><span style={{color: '#fff'}}>{totalSupply ? totalSupply.toString() : '0'} / 6000</span>
//         </div>
//       </div>

//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: '30px', padding: '18px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
//         <span style={{ color: '#cbd5e1' }}>{text.mint_price}</span><span style={{ color: '#22d3ee', fontSize: '1.4rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}>200 USDT</span>
//       </div>

//       {isOwned ? (
//         <button disabled style={styles.btnDisabled}>✅ {text.activated || "Activated"}</button>
//       ) : (
//         needsApproval ? (
//           <button onClick={handleApprove} disabled={isApprovePending || isApproveConfirming || isAutoMinting} style={isApprovePending || isApproveConfirming || isAutoMinting ? styles.btnLoading : styles.btnApprove}>{isApprovePending ? 'Confirm in Wallet...' : (isApproveConfirming || isAutoMinting ? '🚀 Approving & Minting...' : text.step1_approve)}</button>
//         ) : (
//           <button onClick={handleMint} disabled={isMintPending || isMintConfirming} style={isMintPending ? styles.btnLoading : styles.btnMint}>{isMintPending ? 'Processing...' : text.step2_mint}</button>
//         )
//       )}
//       {!isOwned && <div style={{marginTop:'20px', textAlign:'center', color:'#475569', fontSize:'0.8rem'}}>Invited by: <span style={{color:'#64748b'}}>{finalReferrer.slice(0,6)}...{finalReferrer.slice(-4)}</span></div>}
//     </div>
//   );
// }

// const styles = {
//   btnApprove: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s' },
//   btnMint: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)', transition: 'all 0.2s' },
//   btnLoading: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: '#334155', color: '#94a3b8', fontWeight: 'bold', cursor: 'wait' },
//   btnDisabled: { width: '100%', padding: '18px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'default' },
// };

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { GENESIS_NFT_ADDRESS, USDT_ADDRESS, NFT_ABI, USDT_ABI } from './config';
import GenesisNFT from './BMIC-NFT.jpg';

export default function MintCard({ referrerAddress, t }) {
  const { address } = useAccount();
  // 🟢 修改：将默认推荐人地址更改为指定地址
  const finalReferrer = referrerAddress || "0x999eB7fD04a68FC4B2d7Dff1Ad8B2e555280e3D0";
  const text = t || {}; 

  const [isAutoMinting, setIsAutoMinting] = useState(false);

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'totalSupply', args: [], watch: true
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDT_ADDRESS, abi: USDT_ABI, functionName: 'allowance', args: [address, GENESIS_NFT_ADDRESS], watch: true
  });

  const { data: hasMinted, refetch: refetchHasMinted } = useReadContract({
    address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'hasMinted', args: [address], watch: true
  });

  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: writeMint, data: mintHash, isPending: isMintPending, error: mintError } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });

  useEffect(() => { 
    if (isApproveSuccess && isAutoMinting) {
      refetchAllowance();
      writeMint({ address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'mint', args: [finalReferrer] });
      setIsAutoMinting(false);
    }
  }, [isApproveSuccess, isAutoMinting, finalReferrer, writeMint, refetchAllowance]);

  useEffect(() => { 
    if (isMintSuccess) { refetchSupply(); refetchHasMinted(); refetchAllowance(); } 
  }, [isMintSuccess]);

  useEffect(() => { if (mintError) setIsAutoMinting(false); }, [mintError]);

  const PRICE_VAL = parseUnits("200", 18); 
  const isOwned = hasMinted === true;
  const needsApproval = allowance ? allowance < PRICE_VAL : true; 

  const handleApprove = () => {
    setIsAutoMinting(true);
    writeApprove({ address: USDT_ADDRESS, abi: USDT_ABI, functionName: 'approve', args: [GENESIS_NFT_ADDRESS, PRICE_VAL] });
  };

  const handleMint = () => {
    writeMint({ address: GENESIS_NFT_ADDRESS, abi: NFT_ABI, functionName: 'mint', args: [finalReferrer] });
  };

  const cardStyle = {
    background: 'rgba(15, 23, 42, 0.6)', 
    backdropFilter: 'blur(12px)',
    padding: '24px', 
    borderRadius: '0 0 24px 24px', 
    border: '1px solid rgba(56, 189, 248, 0.2)',
    borderTop: 'none', 
    maxWidth: '400px', 
    width: '100%', 
    marginTop: '0px', 
    boxShadow: '0 0 40px rgba(6, 182, 212, 0.1)'
  };

  const headerBg = isOwned 
    ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)' 
    : 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%)';

  return (
    <div style={cardStyle}>
      <div style={{ 
        width: '100%',
        minHeight: '180px',
        background: headerBg, 
        borderRadius: '16px', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative', 
        border: isOwned ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)', 
        overflow: 'hidden' 
      }}>
        
        <img 
          src={GenesisNFT} 
          alt="BMIC Genesis NFT" 
          style={{ 
            width: '100%',    
            height: 'auto',   
            maxHeight: '300px', 
            objectFit: 'cover', 
            display: 'block',   
            borderRadius: '16px', 
            boxShadow: isOwned ? '0 0 30px rgba(16, 185, 129, 0.4)' : '0 0 30px rgba(6, 182, 212, 0.4)',
          }} 
        />
        
        {isOwned && <div style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,0.95)', color:'#059669', fontSize:'0.75rem', padding:'6px 12px', borderRadius:'20px', fontWeight:'800', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>{text.activated || "ACTIVATED"}</div>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{text.mint_title || "Genesis Mint"}</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px', lineHeight: '1.5' }}>{text.mint_desc}</p>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <div style={{ width: '100%', height: '8px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${totalSupply ? (Number(totalSupply) / 6000) * 100 : 0}%`, height: '100%', background: isOwned ? '#10b981' : 'linear-gradient(90deg, #06b6d4, #3b82f6)', transition: 'width 0.5s ease', boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
           <span>Progress</span><span style={{color: '#fff'}}>{totalSupply ? totalSupply.toString() : '0'} / 6000</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: '30px', padding: '18px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color: '#cbd5e1' }}>{text.mint_price}</span><span style={{ color: '#22d3ee', fontSize: '1.4rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}>200 USDT</span>
      </div>

      {isOwned ? (
        <button disabled style={styles.btnDisabled}>✅ {text.activated || "Activated"}</button>
      ) : (
        needsApproval ? (
          <button onClick={handleApprove} disabled={isApprovePending || isApproveConfirming || isAutoMinting} style={isApprovePending || isApproveConfirming || isAutoMinting ? styles.btnLoading : styles.btnApprove}>{isApprovePending ? 'Confirm in Wallet...' : (isApproveConfirming || isAutoMinting ? '🚀 Approving & Minting...' : text.step1_approve)}</button>
        ) : (
          <button onClick={handleMint} disabled={isMintPending || isMintConfirming} style={isMintPending ? styles.btnLoading : styles.btnMint}>{isMintPending ? 'Processing...' : text.step2_mint}</button>
        )
      )}
      {!isOwned && <div style={{marginTop:'20px', textAlign:'center', color:'#475569', fontSize:'0.8rem'}}>Invited by: <span style={{color:'#64748b'}}>{finalReferrer.slice(0,6)}...{finalReferrer.slice(-4)}</span></div>}
    </div>
  );
}

const styles = {
  btnApprove: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s' },
  btnMint: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)', transition: 'all 0.2s' },
  btnLoading: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: '#334155', color: '#94a3b8', fontWeight: 'bold', cursor: 'wait' },
  btnDisabled: { width: '100%', padding: '18px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'default' },
};