"use client";

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';

export default function Home() {
  const [points, setPoints] = useState(0);
  const level = 1;
  const streak = 0;
  const [progress, setProgress] = useState(0);
  const [showCoinPop, setShowCoinPop] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const { setFrameReady } = useMiniKit();
  const { address } = useAccount();

  useEffect(() => {
    setFrameReady();
    const interval = setInterval(() => {
      setPoints((prev) => prev + 1); // Add 1 point every 10 seconds for idle earnings
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTap = () => {
    setPoints(points + 1);
    setShowCoinPop(true);
    setTimeout(() => setShowCoinPop(false), 500);
    if (Math.random() < 0.1) { // 10% chance for jackpot
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    }
  };

  const handleShare = () => {
    const text = `I reached ${points} points in TapBase Empire! Join me and start tapping!`;
    const url = 'https://tapbaseempire.example.com'; // Replace with actual app URL
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">TapBase Empire</h1>
      
      {/* Points Counter */}
      <div className="points-counter mb-4">Points: {points}</div>
      
      {/* Tap Button with SVG Icon */}
      <button className="tap-button relative" onClick={handleTap}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="currentColor"/>
          <path d="M12 6a6 6 0 100 12 6 6 0 000-12z" fill="#FFD700"/>
        </svg>
        {showCoinPop && <div className="coin-pop">+1</div>}
      </button>
      
      {/* Progress Bar */}
      <div className="progress-bar w-64 mt-4">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p>Level {level} Progress</p>
      
      {/* Streak Indicator */}
      <div className="streak-indicator mt-4">Streak: {streak} days</div>
      
      {/* Upgrades Menu */}
      <div className="menu-panel mt-6 w-80">
        <h2 className="text-xl mb-2">Upgrades</h2>
        <button className="upgrade-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="inline mr-2">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Auto-Miner (100 points)
        </button>
        <button className="upgrade-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="inline mr-2">
            <path d="M12 2l10 20H2L12 2z" fill="currentColor"/>
          </svg>
          Booster (200 points)
        </button>
      </div>
      
      {/* Social Buttons */}
      <div className="flex mt-4">
        <button className="leaderboard-button mr-2">Leaderboard</button>
        <button className="referral-button mr-2">Refer Friend</button>
        <button className="share-button" onClick={handleShare}>Share on Farcaster</button>
      </div>
      
      {/* Wallet Connection */}
      <div className="mt-4">
        {address ? (
          <p className="text-green-500">Connected: {address}</p>
        ) : (
          <Wallet>
            <ConnectWallet />
          </Wallet>
        )}
      </div>
      
      {/* Reward Notification */}
      {showReward && <div className="reward-notification">Jackpot! +100 points</div>}
      
      {/* Idle Animation Example */}
      <div className="idle-rig mt-4">Mining Rig</div>
    </div>
  );
}
