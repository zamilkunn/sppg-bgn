import React, { useState } from 'react';
import BgnLogo from './BgnLogo';

export default function Login({ credentials, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === credentials.username && password === credentials.password) {
      onLoginSuccess();
    } else {
      setError('Username atau password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="login-container">
      {/* Background Decorative Shapes */}
      <div className="login-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="login-card">
        <div className="login-logo-container">
          <div className="login-logo">
            <BgnLogo size={70} />
          </div>
          <h2 className="login-title">BADAN GIZI NASIONAL</h2>
          <div className="login-subtitle">SPPG Al-Uzlah Islamic</div>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Username</label>
            <div className="input-field-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                className="input-field"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div className="input-field-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn">
            Masuk ke Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
