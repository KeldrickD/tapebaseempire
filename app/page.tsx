"use client";

import { useState, useEffect, useCallback } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, Hash } from 'viem';

// Add USDC constants at top level:
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RESOURCE_WALLET = process.env.NEXT_PUBLIC_RESOURCE_WALLET_ADDRESS || '0xYourWalletAddressHere'; // Set in .env
const USDC_DECIMALS = 6;
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
];

export default function Home() {
  const [points, setPoints] = useState(0);
  const level = 1;
  const streak = 0;
  const progress = 0;
  const [showCoinPop, setShowCoinPop] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const { setFrameReady } = useMiniKit();
  const { address } = useAccount();

  // Add states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isEventActive, setIsEventActive] = useState(false);
  const [eventTimer, setEventTimer] = useState(0);

  const [hasPremium, setHasPremium] = useState(false);
  const [autoMinerLevel, setAutoMinerLevel] = useState(0);
  const [boosterLevel, setBoosterLevel] = useState(0);

  // In the imports section
  const [quickTapActive, setQuickTapActive] = useState(false);
  const [autoMinerUnlocked, setAutoMinerUnlocked] = useState(false);
  const [gems, setGems] = useState(0);
  const [expansionUnlocked, setExpansionUnlocked] = useState(false);
  const [dailyMultiplier, setDailyMultiplier] = useState(1);
  const [jackpotTickets, setJackpotTickets] = useState(0);
  const [vipActive, setVipActive] = useState(false);
  const [levelBoosts, setLevelBoosts] = useState(0);
  const [resourceDrops, setResourceDrops] = useState(0);
  const [crownPack, setCrownPack] = useState(false);

  // Load all states from localStorage
  useEffect(() => {
    const storedPremium = localStorage.getItem('hasPremium');
    if (storedPremium) {
      setHasPremium(JSON.parse(storedPremium));
    }
    const storedAuto = localStorage.getItem('autoMinerLevel');
    if (storedAuto) {
      setAutoMinerLevel(JSON.parse(storedAuto));
    }
    const storedBooster = localStorage.getItem('boosterLevel');
    if (storedBooster) {
      setBoosterLevel(JSON.parse(storedBooster));
    }
    setQuickTapActive(JSON.parse(localStorage.getItem('quickTapActive') || 'false'));
    setAutoMinerUnlocked(JSON.parse(localStorage.getItem('autoMinerUnlocked') || 'false'));
    setGems(JSON.parse(localStorage.getItem('gems') || '0'));
    setExpansionUnlocked(JSON.parse(localStorage.getItem('expansionUnlocked') || 'false'));
    setDailyMultiplier(JSON.parse(localStorage.getItem('dailyMultiplier') || '1'));
    setJackpotTickets(JSON.parse(localStorage.getItem('jackpotTickets') || '0'));
    setVipActive(JSON.parse(localStorage.getItem('vipActive') || 'false'));
    setLevelBoosts(JSON.parse(localStorage.getItem('levelBoosts') || '0'));
    setResourceDrops(JSON.parse(localStorage.getItem('resourceDrops') || '0'));
    setCrownPack(JSON.parse(localStorage.getItem('crownPack') || 'false'));
  }, []);

  // Save all states to localStorage
  useEffect(() => {
    localStorage.setItem('hasPremium', JSON.stringify(hasPremium));
    localStorage.setItem('autoMinerLevel', JSON.stringify(autoMinerLevel));
    localStorage.setItem('boosterLevel', JSON.stringify(boosterLevel));
    localStorage.setItem('quickTapActive', JSON.stringify(quickTapActive));
    localStorage.setItem('autoMinerUnlocked', JSON.stringify(autoMinerUnlocked));
    localStorage.setItem('gems', JSON.stringify(gems));
    localStorage.setItem('expansionUnlocked', JSON.stringify(expansionUnlocked));
    localStorage.setItem('dailyMultiplier', JSON.stringify(dailyMultiplier));
    localStorage.setItem('jackpotTickets', JSON.stringify(jackpotTickets));
    localStorage.setItem('vipActive', JSON.stringify(vipActive));
    localStorage.setItem('levelBoosts', JSON.stringify(levelBoosts));
    localStorage.setItem('resourceDrops', JSON.stringify(resourceDrops));
    localStorage.setItem('crownPack', JSON.stringify(crownPack));
  }, [hasPremium, autoMinerLevel, boosterLevel, quickTapActive, autoMinerUnlocked, gems, expansionUnlocked, dailyMultiplier, jackpotTickets, vipActive, levelBoosts, resourceDrops, crownPack]);

  // Quick Tap Booster timer
  useEffect(() => {
    if (quickTapActive) {
      const timer = setTimeout(() => setQuickTapActive(false), 3600000); // 1 hour
      return () => clearTimeout(timer);
    }
  }, [quickTapActive]);

  // VIP Pass timer (7 days)
  useEffect(() => {
    if (vipActive) {
      const timer = setTimeout(() => setVipActive(false), 604800000); // 7 days
      return () => clearTimeout(timer);
    }
  }, [vipActive]);

  // Modify handleTap for quick tap and VIP
  const handleTap = () => {
    let increment = isEventActive ? 2 : 1;
    increment += boosterLevel;
    if (hasPremium) increment *= 2;
    if (quickTapActive) increment *= 2;
    if (vipActive) increment *= 1.5; // 50% faster, but for taps interpret as multiplier
    setPoints(points + increment);
    setShowCoinPop(true);
    setTimeout(() => setShowCoinPop(false), 500);
    if (Math.random() < 0.1) {
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    }
  };

  // Auto-miner effect if unlocked
  useEffect(() => {
    if (autoMinerUnlocked) {
      const interval = setInterval(() => {
        setPoints((prev) => prev + Math.floor(prev * 0.1)); // 10% of current points? Or fixed? Adjust as needed.
      }, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [autoMinerUnlocked, points]);

  // Mock leaderboard data
  const leaderboardData = [
    { name: 'Player1', points: 1000 },
    { name: 'Player2', points: 800 },
    { name: 'You', points: points },
  ];

  // Modify idle earnings with auto-miner
  useEffect(() => {
    setFrameReady();
    const interval = setInterval(() => {
      setPoints((prev) => prev + 1 + autoMinerLevel); // Base 1 + level
    }, 10000);
    return () => clearInterval(interval);
  }, [setFrameReady, autoMinerLevel]);

  // Event logic in useEffect
  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance every 60s
        setIsEventActive(true);
        setEventTimer(30);
        const countdown = setInterval(() => {
          setEventTimer((prev) => {
            if (prev <= 1) {
              setIsEventActive(false);
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 60000);
    return () => clearInterval(eventInterval);
  }, []);

  // Handlers for each purchase success
  const { writeContractAsync } = useContractWrite();
  const [pendingHash, setPendingHash] = useState<Hash | undefined>(undefined);
  const [pendingOnSuccess, setPendingOnSuccess] = useState<(() => void) | undefined>(undefined);
  const { data: receipt } = useWaitForTransactionReceipt({ hash: pendingHash });

  useEffect(() => {
    if (receipt?.status === 'success' && pendingOnSuccess) {
      pendingOnSuccess();
      setPendingHash(undefined);
      setPendingOnSuccess(undefined);
    }
  }, [receipt, pendingOnSuccess]);

  const handlePurchase = useCallback((price: number, onSuccess: () => void) => {
    const amount = parseUnits(price.toString(), USDC_DECIMALS);
    writeContractAsync({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [RESOURCE_WALLET, amount],
    }).then((hash) => {
      setPendingHash(hash);
      setPendingOnSuccess(onSuccess);
    }).catch((error) => {
      console.error('Purchase error:', error);
    });
  }, [writeContractAsync]);

  const buyAutoMiner = () => {
    const cost = 100 * (autoMinerLevel + 1);
    if (points >= cost) {
      setPoints(points - cost);
      setAutoMinerLevel(autoMinerLevel + 1);
    }
  };

  const buyBooster = () => {
    const cost = 200 * (boosterLevel + 1);
    if (points >= cost) {
      setPoints(points - cost);
      setBoosterLevel(boosterLevel + 1);
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
        <button className="upgrade-button" onClick={buyAutoMiner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="inline mr-2">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Auto-Miner Lv.{autoMinerLevel + 1} ({100 * (autoMinerLevel + 1)} points)
        </button>
        <button className="upgrade-button" onClick={buyBooster}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="inline mr-2">
            <path d="M12 2l10 20H2L12 2z" fill="currentColor"/>
          </svg>
          Booster Lv.{boosterLevel + 1} ({200 * (boosterLevel + 1)} points)
        </button>
        {!hasPremium && (
          <button
            onClick={() => handlePurchase(5.00, () => {
              setHasPremium(true);
            })}
            disabled={!address}
          >
            Buy Premium Booster (5.00 USDC)
          </button>
        )}
        {hasPremium && <p className="text-green-500">Premium Unlocked!</p>}
        <button
          onClick={() => handlePurchase(0.10, () => {
            setQuickTapActive(true);
            setTimeout(() => setQuickTapActive(false), 3600000); // 1 hour
          })}
          disabled={quickTapActive || !address}
        >
          Buy Quick Tap Booster (0.10 USDC)
        </button>
        <button
          onClick={() => handlePurchase(0.50, () => {
            setAutoMinerUnlocked(true);
          })}
          disabled={!address}
        >
          Buy Auto-Miner Unlock (0.50 USDC)
        </button>
        <button
          onClick={() => handlePurchase(0.25, () => {
            setGems((prev) => prev + 500);
          })}
          disabled={!address}
        >
          Buy Gem Bundle (Small) (0.25 USDC)
        </button>
        <button
          onClick={() => handlePurchase(1.00, () => {
            setExpansionUnlocked(true);
          })}
          disabled={!address}
        >
          Buy Empire Expansion Pack (1.00 USDC)
        </button>
        <button
          onClick={() => handlePurchase(0.05, () => {
            setDailyMultiplier(3);
          })}
          disabled={!address}
        >
          Buy Daily Reward Multiplier (0.05 USDC)
        </button>
        <button
          onClick={() => handlePurchase(0.15, () => {
            setJackpotTickets((prev) => prev + 1);
          })}
          disabled={!address}
        >
          Buy Jackpot Spin Ticket (0.15 USDC)
        </button>
        <button
          onClick={() => handlePurchase(2.00, () => {
            setVipActive(true);
          })}
          disabled={!address}
        >
          Buy VIP Pass (7-Day) (2.00 USDC)
        </button>
        <button
          onClick={() => handlePurchase(0.75, () => {
            setLevelBoosts((prev) => prev + 1);
          })}
          disabled={!address}
        >
          Buy Instant Level Boost (0.75 USDC)
        </button>
        <button
          onClick={() => handlePurchase(0.30, () => {
            setResourceDrops((prev) => prev + 1);
          })}
          disabled={!address}
        >
          Buy Resource Mega-Drop (0.30 USDC)
        </button>
        <button
          onClick={() => handlePurchase(0.40, () => {
            setCrownPack(true);
          })}
          disabled={!address}
        >
          Buy Cosmetic Crown Pack (0.40 USDC)
        </button>
      </div>
      
      {/* Event Banner */}
      {isEventActive && <div className="event-banner">Double Points Event! {eventTimer}s left</div>}
      
      {/* Social Buttons - Update Leaderboard button */}
      <div className="flex mt-4">
        <button className="leaderboard-button mr-2" onClick={() => setShowLeaderboard(true)}>Leaderboard</button>
        <button className="referral-button mr-2">Refer Friend</button>
        <button className="share-button" onClick={handleShare}>Share on Farcaster</button>
      </div>
      
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="leaderboard-modal">
          <h2>Leaderboard</h2>
          <ul>
            {leaderboardData.sort((a, b) => b.points - a.points).map((player, index) => (
              <li key={index}>{player.name}: {player.points}</li>
            ))}
          </ul>
          <button onClick={() => setShowLeaderboard(false)}>Close</button>
        </div>
      )}
      
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
