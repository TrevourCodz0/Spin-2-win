import React, { useEffect, useRef, useState } from 'react';
import { TonConnect } from '@tonconnect/sdk';
import '../styles/Home.css';
import Logout from '../components/Logout';
import { useUser } from '../src/context/UserContext';

const connector = new TonConnect({
  manifestUrl: 'https://aquacoinx.github.io/Spin-2-earn/tonconnect-manifest.json',
});

const PRIZES = [
  { value: 5, currency: 'AQCNX', type: 'Common', chance: 45 },
  { value: "Try again", currency: '', type: "common", chance: 10 },
  { value: 10, currency: 'TON', type: 'Rare', chance: 20 },
  { value: 100, currency: '$', type: 'Voucher', chance: 5 },
  { value: 20, currency: 'AQCNX', type: 'Common', chance: 20 },
  { value: 50, currency: 'AQCNX', type: 'Uncommon', chance: 8 },
  { value: 0.3, currency: 'TON', type: 'Epic', chance: 2 },
];

function Home() {
  const [wallet, setWallet] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [rewards, setRewards] = useState({ AQCNX: 0, TON: 0, vouchers: 0 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const { user } = useUser();

  const prizeDisplayRef = useRef();
  const prizeIconRef = useRef();
  const prizeAmountRef = useRef();
  const prizeTypeRef = useRef();
  const voucherNoteRef = useRef();

  useEffect(() => {
    connector.restoreConnection().then((connectedWallet) => {
      if (connectedWallet) setWallet(connectedWallet);
    });
    connector.onStatusChange(setWallet);
  }, []);

  const connectWallet = async () => {
    const universalLink = await connector.connect({
      universalLink: 'https://app.tonkeeper.com/ton-connect',
      bridgeUrl: 'https://bridge.tonapi.io/bridge',
    });
    window.open(universalLink, '_blank');
  };

  const withdraw = async (currency) => {
    if (!wallet || !wallet.account?.address) {
      alert('Please connect your TON wallet first.');
      return;
    }

    const amount = rewards[currency];
    if (amount <= 0) {
      alert(`You have no ${currency} to withdraw.`);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currency,
          amount,
          wallet: wallet.account.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Withdrawal failed.');
        return;
      }

      alert(`✅ Successfully withdrew ${amount} ${currency}!`);

      // Reset reward after withdrawal
      setRewards((prev) => ({
        ...prev,
        [currency]: 0,
      }));
    } catch (err) {
      console.error(err);
      alert('An error occurred during withdrawal.');
    }
  };

  const showPrizeDisplay = (segment) => {
    const iconMap = { AQCNX: '🪙', TON: '💎', $: '🎫' };
    prizeIconRef.current.textContent = iconMap[segment.currency];
    prizeAmountRef.current.textContent =
      segment.currency === '$' ? `$${segment.value} Voucher` : `${segment.value} ${segment.currency}`;
    prizeTypeRef.current.textContent = `${segment.type} Reward`;
    voucherNoteRef.current.style.display = segment.currency === '$' ? 'block' : 'none';
    prizeDisplayRef.current.classList.add('show');
    setTimeout(() => prizeDisplayRef.current.classList.remove('show'), 4000);
  };

  const spin = async () => {
    if (spinsLeft <= 0 || isSpinning) return;
    setIsSpinning(true);
    try {
      const response = await fetch('http://localhost:5000/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Spin failed.');
        setIsSpinning(false);
        return;
      }

      const selectedIndex = PRIZES.findIndex(
        (p) => p.value === data.value && p.currency === data.currency && p.type === data.type
      );

      if (selectedIndex === -1) {
        alert('Invalid reward data');
        setIsSpinning(false);
        return;
      }

      const steps = [];
      for (let i = 0; i < 15; i++) {
        steps.push(Math.floor(Math.random() * PRIZES.length));
      }
      steps.push(selectedIndex);

      let index = 0;
      const interval = setInterval(() => {
        setHighlightIndex(steps[index]);
        index++;
        if (index >= steps.length) {
          clearInterval(interval);

          const segment = PRIZES[selectedIndex];
          if (segment.currency !== '') {
            setRewards((prev) => {
              const updated = { ...prev };
              if (segment.currency === 'AQCNX') updated.AQCNX += segment.value;
              else if (segment.currency === 'TON') updated.TON += segment.value;
              else if (segment.currency === '$') updated.vouchers += segment.value;
              return updated;
            });
            setRewardHistory((prev) => [segment, ...prev.slice(0, 9)]);
            setSpinsLeft((prev) => prev - 1);
          }

          showPrizeDisplay(segment);
          setIsSpinning(false);
        }
      }, 100);
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
      setIsSpinning(false);
    }
  };

  const buySpins = (amount) => {
    setSpinsLeft((prev) => prev + amount);
    prizeDisplayRef.current.classList.add('show');
    prizeIconRef.current.textContent = '🎫';
    prizeAmountRef.current.textContent = `+${amount} Spins`;
    prizeTypeRef.current.textContent = 'Purchase Complete';
    setTimeout(() => {
      prizeDisplayRef.current.classList.remove('show');
    }, 2000);
  };
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!user?.email) return;
      const res = await fetch(`http://localhost:5000/user?email=${user.email}`);
      const data = await res.json();
      if (res.ok) {
        setRewards({
          AQCNX: data.reward_balance_aqcnx,
          TON: data.reward_balance_ton,
          vouchers: data.reward_vouchers,
        });
      }
    };

    fetchUserBalance();
  }, [user?.email]);


  return (
    <div className="container">
      <div className="header">
        <h1 className="title">AquaCoin-<span className="title-accent">Reward</span> Spin</h1>
        <p className="subtitle">Spin to earn AQCNX, TON, and $100 vouchers!</p>
      </div>

      <div>
        <h2>Wallet Section</h2>
        {wallet ? (
          <p><strong>Connected Wallet:</strong> {wallet.account.address}</p>
        ) : (
          <button onClick={connectWallet} className="btn btn-primary">Connect Wallet</button>
        )}
      </div>

      <Logout />

      <div className="game-stats">
        <div className="stat-card"><div className="stat-label">Spins Left</div><div className="stat-value">{spinsLeft}</div></div>
        <div className="stat-card"><div className="stat-label">Total AQCNX</div><div className="stat-value">{rewards.AQCNX}</div></div>
        <div className="stat-card"><div className="stat-label">Total TON</div><div className="stat-value">{rewards.TON}</div></div>
        <div className="stat-card"><div className="stat-label">Vouchers Won</div><div className="stat-value">{rewards.vouchers}</div></div>
      </div>
      <div className="card">
        <div className="card-title">💸 Withdraw Earnings</div>
        <div className="buy-spins">
          <button
            className="buy-spin-btn"
            onClick={() => withdraw('AQCNX')}
            disabled={rewards.AQCNX <= 0}
          >
            Withdraw AQCNX<br />{rewards.AQCNX}
          </button>

          <button
            className="buy-spin-btn"
            onClick={() => withdraw('TON')}
            disabled={rewards.TON <= 0}
          >
            Withdraw TON<br />{rewards.TON}
          </button>
        </div>
      </div>


      <div className="main-content">
        <div className="wheel-section">
          <div className="glow-circle">
            {PRIZES.map((prize, idx) => (
              <div
                key={idx}
                className={`glow-segment circular ${highlightIndex === idx ? 'glow' : ''}`}
                style={{ transform: `rotate(${(360 / PRIZES.length) * idx}deg) translate(0, -40px)`, paddingTop: 10 }}

              >
                <span>{prize.value} {prize.currency}</span>
              </div>
            ))}
            <button className="wheel-center-button" onClick={spin} disabled={isSpinning}>
              <span>{isSpinning ? 'SPINNING...' : 'SPIN'}</span>
            </button>
          </div>
        </div>

        <div className="sidebar">
          <div className="card">
            <div className="card-title">🎫 Buy Spins</div>
            <div className="buy-spins">
              <button className="buy-spin-btn" onClick={() => buySpins(1)}>1 Spin<br />10 aqcnx</button>
              <button className="buy-spin-btn" onClick={() => buySpins(5)}>5 Spins<br />20 aqcnx</button>
              <button className="buy-spin-btn" onClick={() => buySpins(10)}>10 Spins<br />50 aqcnx</button>
              <button className="buy-spin-btn" style={{ width: '100%' }} onClick={() => buySpins(20)}>20 Spins - 100 aqcnx</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">🏆 Recent Rewards</div>
            <div id="rewardsHistory" className="history">
              {rewardHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#bfdbfe', padding: '2rem' }}>
                  No rewards yet. Start spinning!
                </div>
              ) : (
                rewardHistory.map((reward, idx) => (
                  <div key={idx} className="history-item">
                    <span className="history-icon">
                      {reward.currency === 'AQCNX' ? '🪙' : reward.currency === 'TON' ? '💎' : '🎫'}
                    </span>
                    <span className="history-text">
                      {reward.currency === '$' ? `$${reward.value} Voucher` : `${reward.value} ${reward.currency}`}
                    </span>
                    <span className="history-type">{reward.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div ref={prizeDisplayRef} id="prizeDisplay" className="prize-display">
        <div ref={prizeIconRef} className="prize-icon">🎉</div>
        <div className="prize-title">Congratulations!</div>
        <div ref={prizeAmountRef} className="prize-amount">50 AQCNX</div>
        <div ref={prizeTypeRef} className="prize-type">Common Reward</div>
        <div ref={voucherNoteRef} style={{ color: '#bfdbfe', fontSize: '0.875rem', display: 'none' }}>
          Check your email for voucher details
        </div>
      </div>
    </div>
  );
}

export default Home;
