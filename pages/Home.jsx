import React, { useEffect, useRef, useState } from 'react';
import { TonConnect } from '@tonconnect/sdk';
import '../styles/Home.css';

const connector = new TonConnect({
  manifestUrl: 'https://aquacoinx.github.io/Spin-2-earn/tonconnect-manifest.json',
});

function Home() {
  const [wallet, setWallet] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [rewards, setRewards] = useState({ AQCNX: 0, TON: 0, vouchers: 0 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rewardHistory, setRewardHistory] = useState([]);

  const wheelRef = useRef();
  const prizeDisplayRef = useRef();
  const prizeIconRef = useRef();
  const prizeAmountRef = useRef();
  const prizeTypeRef = useRef();
  const voucherNoteRef = useRef();

  const segments = [
    { value: 20, currency: 'AQCNX', type: 'Common', angle: 60 },
    { value: 0.5, currency: 'TON', type: 'Rare', angle: 120 },
    { value: 100, currency: '$', type: 'Voucher', angle: 180 },
    { value: 30, currency: 'AQCNX', type: 'Common', angle: 240 },
    { value: 50, currency: 'AQCNX', type: 'Uncommon', angle: 300 },
    { value: 0.3, currency: 'TON', type: 'Epic', angle: 360 },
  ];

  let currentRotation = useRef(0);

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

  const sendTon = async () => {
    if (!wallet) return alert('Please connect your wallet first.');
    try {
      await connector.sendTransaction({
        valid_until: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: 'uf43b7r6v8719rv76rc5vx',
            amount: '10000000',
          },
        ],
      });
      alert('Transaction sent.');
    } catch (error) {
      alert('Transaction failed.');
      console.error(error);
    }
  };

  const showPrizeDisplay = (segment) => {
    const iconMap = {
      AQCNX: '🪙',
      TON: '💎',
      $: '🎫',
    };

    prizeIconRef.current.textContent = iconMap[segment.currency];
    prizeAmountRef.current.textContent =
      segment.currency === '$' ? `$${segment.value} Voucher` : `${segment.value} ${segment.currency}`;
    prizeTypeRef.current.textContent = `${segment.type} Reward`;

    if (segment.currency === '$') {
      voucherNoteRef.current.style.display = 'block';
    } else {
      voucherNoteRef.current.style.display = 'none';
    }

    prizeDisplayRef.current.classList.add('show');
    setTimeout(() => {
      prizeDisplayRef.current.classList.remove('show');
    }, 4000);
  };

  const spin = () => {
    if (spinsLeft <= 0 || isSpinning) return;
    setIsSpinning(true);
    setSpinsLeft((prev) => prev - 1);

    const selectedSegment = segments[Math.floor(Math.random() * segments.length)];
    const minSpins = 20;
    const maxSpins = 50;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const totalRotation = spins * 360;
    const finalRotation = currentRotation.current + totalRotation + (360 - selectedSegment.angle);

    wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
    wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
    currentRotation.current = finalRotation % 360;

    setTimeout(() => {
      // Add reward
      setRewards((prev) => {
        const updated = { ...prev };
        if (selectedSegment.currency === 'AQCNX') updated.AQCNX += selectedSegment.value;
        else if (selectedSegment.currency === 'TON') updated.TON += selectedSegment.value;
        else if (selectedSegment.currency === '$') updated.vouchers += selectedSegment.value;
        return updated;
      });

      // Add to reward history
      setRewardHistory((prev) => [selectedSegment, ...prev.slice(0, 9)]);
      showPrizeDisplay(selectedSegment);
      setIsSpinning(false);
    }, 4000);
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

      <div className="game-stats">
        <div className="stat-card"><div className="stat-label">Spins Left</div><div className="stat-value">{spinsLeft}</div></div>
        <div className="stat-card"><div className="stat-label">Total AQCNX</div><div className="stat-value">{rewards.AQCNX}</div></div>
        <div className="stat-card"><div className="stat-label">Total TON</div><div className="stat-value">{rewards.TON}</div></div>
        <div className="stat-card"><div className="stat-label">Vouchers Won</div><div className="stat-value">{rewards.vouchers}</div></div>
      </div>

      <div className="main-content">
        <div className="wheel-section">
          <div className="wheel-container">
            <div ref={wheelRef} id="wheel" className="wheel">
              {segments.map((seg, index) => (
                <div key={index} className={`wheel-segment segment-${index + 1}`}>
                  <span className="segment-text">
                    {seg.currency === '$' ? `$${seg.value} Voucher` : `${seg.value} ${seg.currency}`}
                  </span>
                </div>
              ))}
            </div>
            <button id="spinButton" className="wheel-center-button" onClick={spin}>
              <span>{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</span>
            </button>
            <div className="wheel-pointer"></div>
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
        <div ref={prizeIconRef} id="prizeIcon" className="prize-icon">🎉</div>
        <div className="prize-title">Congratulations!</div>
        <div ref={prizeAmountRef} id="prizeAmount" className="prize-amount">50 AQCNX</div>
        <div ref={prizeTypeRef} id="prizeType" className="prize-type">Common Reward</div>
        <div ref={voucherNoteRef} id="voucherNote" style={{ color: '#bfdbfe', fontSize: '0.875rem', display: 'none' }}>
          Check your email for voucher details
        </div>
      </div>
    </div>
  );
}

export default Home;
