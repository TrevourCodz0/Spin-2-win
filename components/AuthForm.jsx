import React from 'react';

const AuthForm = ({ type, onSubmit, formData, setFormData }) => {
  const isLogin = type === 'login';

  return (
    <form onSubmit={onSubmit} className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
      <div className="card-title">{isLogin ? '🔐 Login' : '📝 Sign Up'}</div>

      {!isLogin && (
        <input
          type="text"
          placeholder="Username"
          required
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="btn"
          style={{ marginBottom: '1rem' }}
        />
      )}

      <input
        type="email"
        placeholder="Email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="btn1"
        style={{ marginBottom: '1rem' }}
      />

      <input
        type="password"
        placeholder="Password"
        required
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="btn"
        style={{ marginBottom: '1rem' }}
      />

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
        {isLogin ? 'Login' : 'Create Account'}
      </button>
    </form>
  );
};

export default AuthForm;
