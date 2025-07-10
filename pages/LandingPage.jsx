import React from 'react';
import '../styles/LandingPage.css';
import previewImage from '../src/assets/splash.png';
import Navbar from '../components/NavBar';

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <div className="landing-wrapper">
        <div className="landing-left">
          <h1 className="landing-title">
            AquaCoin <span className="highlight">Reward Spin</span>
          </h1>
          <p className="landing-description">
            Spin to earn AquaCoin rewards, prizes and bonus spins. The more Aqua you hold, the more chances you get.
          </p>
          <a href="/signup" className="cta-button">Get Started</a>
        </div>
        <div className="landing-right">
          <img src={previewImage} alt="Aqua Spin App Preview" className="preview-image" />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
