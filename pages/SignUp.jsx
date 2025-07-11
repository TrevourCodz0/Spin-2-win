import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../src/context/UserContext'; // 👈 import the context
import '../src/index.css'
const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const navigate = useNavigate();
  const { setUser } = useUser(); // 👈 access setUser from context

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://spin2winapi.onrender.com/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user); // ✅ save user globally
        alert('✅ Account created!');
        navigate('/spin2win');
      } else {
        alert(data.error || '❌ Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">AquaCoin - <span className="title-accent">Sign Up</span></h1>
        <p className="subtitle">Join and start spinning for rewards</p>
      </div>
      <AuthForm
        type="signup"
        onSubmit={handleSignup}
        formData={formData}
        setFormData={setFormData}
      />
      <div className="change">
        Already have an account?
        <button className="btn" onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );
};

export default Signup;
