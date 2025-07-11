import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/spin2win');
    }, 3000);

    return () => clearTimeout(timer); // Clean up on unmount
  }, [navigate]);

  const handleRedirect = () => {
    navigate('/spin2win');
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">🎉 Success!</h1>
        <p className="subtitle">Redirecting to <span className="title-accent">Spin2Win</span> in 3 seconds...</p>
      </div>

      <div className="card">
        <h2 className="card-title">You’ve successfully signed in 🥳</h2>
        <p style={{ textAlign: 'center' }}>
          Hang tight while we take you to the rewards dashboard!
        </p>
      </div>

      <div className="change">
        <button className="btn btn-primary" onClick={handleRedirect}>Go Now</button>
      </div>
    </div>
  );
};

export default Success;
