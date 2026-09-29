import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Terminal, Shield, LogIn, Sparkles, Key } from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

export const LoginModal: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, enterGuestAdminMode } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toastSuccess('Successfully signed in to TKMFOSS Admin.');
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toastSuccess('Successfully signed in with Google.');
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    enterGuestAdminMode();
    toastSuccess('Entered demo administrator mode.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 50% 30%, #0d1527 0%, #06070a 100%)',
      position: 'relative'
    }}>
      {/* Decorative Grid Lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0, 255, 102, 0.08)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(0,255,102,0.2), rgba(0,210,255,0.2))',
            border: '2px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)',
            boxShadow: '0 0 24px rgba(0,255,102,0.3)'
          }}>
            <Terminal size={28} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
            TKMFOSS <span style={{ color: 'var(--accent-green)' }}>Admin</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Enter administrator credentials to manage events, execom, and announcements.
          </p>

          <div style={{
            marginTop: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '99px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}>
            <Shield size={12} color="var(--accent-cyan)" />
            <span>Target: {firebaseConfig.projectId}</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@foss.tkmce.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px', height: '44px' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In with Firebase'}</span>
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>or sign in with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-secondary"
            style={{ width: '100%', height: '42px' }}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Google Workspace</span>
          </button>

          {/* Instant Demo Access Button */}
          <button
            type="button"
            onClick={handleDemoMode}
            className="btn btn-secondary"
            style={{
              width: '100%',
              height: '42px',
              borderStyle: 'dashed',
              borderColor: 'var(--accent-green)',
              color: 'var(--accent-green)',
              background: 'rgba(0, 255, 102, 0.05)'
            }}
          >
            <Sparkles size={16} />
            <span>⚡ Instant Demo Access (No Password Needed)</span>
          </button>
        </div>

        <div style={{
          marginTop: '22px',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0,0,0,0.3)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '8px'
        }}>
          <Key size={14} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Connected to <strong>admin-web-16b4a</strong>. Use Demo Access to test immediately before configuring Firebase Auth accounts in the console.
          </span>
        </div>
      </div>
    </div>
  );
};
