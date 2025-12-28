'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', background: '#fff' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '18px' }}>Order Queue System - TEST</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Dynamic Priority Queue with VIP Support
        </p>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/login"
            style={{
              padding: '8px 16px',
              background: '#0066cc',
              color: '#fff',
              textDecoration: 'none',
              border: 'none'
            }}
          >
            Login
          </Link>
          <Link
            href="/register"
            style={{
              padding: '8px 16px',
              background: '#666',
              color: '#fff',
              textDecoration: 'none',
              border: 'none'
            }}
          >
            Register
          </Link>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9', fontSize: '12px' }}>
          <p><strong>Features:</strong></p>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
            <li>realtime queue updates</li>
            <li>VIP priority processing</li>
            <li>live stock tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
