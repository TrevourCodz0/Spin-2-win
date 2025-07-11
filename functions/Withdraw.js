export const withdraw = async (currency) => {
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
