import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn } from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

export const LoginModal: React.FC = () => {
  const { loginWithEmail } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toastSuccess('Authenticated successfully.');
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#090a0d',
      fontFamily: 'var(--font-mono)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#101115',
        border: '2px solid #2b2c31',
        boxShadow: '6px 6px 0px #000000',
        padding: '32px 28px'
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #232429',
          paddingBottom: '12px',
          marginBottom: '24px',
          fontSize: '0.72rem',
          color: '#71717a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: '#00ff66', display: 'inline-block' }}></span>
            <span style={{ color: '#00ff66', fontWeight: 'bold' }}>// AUTH_GATE</span>
          </div>
          <div>TARGET: {firebaseConfig.projectId || 'FIREBASE'}</div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: '#16171d',
            border: '1px solid #27272a',
            color: '#00f0ff',
            fontSize: '0.7rem',
            marginBottom: '10px'
          }}>
            [ROOT ACCESS]
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            color: '#ffffff',
            margin: '0 0 6px 0',
            fontFamily: 'var(--font-sans)'
          }}>
            TKMFOSS Admin
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.8rem', lineHeight: '1.4', margin: 0, fontFamily: 'var(--font-sans)' }}>
            Enter administrator credentials to authenticate and manage events, announcements, and committee records.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              color: '#d4d4d8',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@foss.tkmce.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                background: '#14151a',
                border: '1px solid #2b2c31',
                padding: '10px 12px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              color: '#d4d4d8',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                background: '#14151a',
                border: '1px solid #2b2c31',
                padding: '10px 12px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              background: '#00ff66',
              color: '#000000',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0px #000000',
              padding: '12px',
              fontWeight: 800,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.1s'
            }}
          >
            <LogIn size={15} />
            <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #1f2025',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#52525b'
        }}>
          <span>STATUS: SECURE_CHANNEL</span>
          <span>TKMCE FOSS CELL</span>
        </div>
      </div>
    </div>
  );
};
