'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(username, password, isVip);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', background: '#fff' }}>
        <h1 style={{ marginBottom: '15px', fontSize: '16px' }}>REGISTER</h1>
        
        {error && (
          <div style={{ background: '#fee', border: '1px solid #c00', padding: '8px', marginBottom: '15px', color: '#c00', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '6px', border: '1px solid #ccc', fontSize: '14px' }}
              required
              minLength={3}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '6px', border: '1px solid #ccc', fontSize: '14px' }}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              VIP Member (priority processing)
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              background: isLoading ? '#999' : (isVip ? '#cc6600' : '#0066cc'),
              color: '#fff',
              border: 'none',
              fontSize: '14px'
            }}
          >
            {isLoading ? 'Loading...' : (isVip ? 'Register (VIP)' : 'Register')}
          </button>
        </form>

        <p style={{ marginTop: '15px', fontSize: '12px', textAlign: 'center' }}>
          Have account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
