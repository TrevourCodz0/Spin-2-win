export const fetchSpinCount = async (email) => {
    console.log(email);
  try {
    const response = await fetch('http://localhost:5000/spin-count', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch spin count');
    }

    console.log('Spins Today:', data.spins_today);
    console.log('Spins Left:', data.spins_left);

    return data;
  } catch (err) {
    console.error('Error fetching spin count:', err.message);
    return { spins_today: 0, spins_left: 0, error: err.message };
  }
};
