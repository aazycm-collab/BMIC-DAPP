import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 移除 RainbowKitProvider 的引用，移到 App.jsx 去
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'BMIC DApp',
  projectId: 'YOUR_PROJECT_ID', 
  chains: [bscTestnet],
  ssr: false, 
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 注意：这里不再包裹 RainbowKitProvider，由 App 内部自己处理 */}
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);