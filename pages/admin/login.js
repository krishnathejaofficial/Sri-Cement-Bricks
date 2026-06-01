import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/admin/login', form);
      toast.success('Welcome back, Admin!');
      router.push('/admin');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Admin Login — KRISHNATEJA BRICKS</title><link rel="icon" href="/krishnatejabrickslogo.png" /></Head>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0500, #1c0a00, #3d1a02)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '10%', right: '10%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,65,12,0.2) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
        }} />

        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px', padding: '48px', width: '100%', maxWidth: 440,
          position: 'relative',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: 60, height: 60,
              borderRadius: '16px', overflow: 'hidden',
              margin: '0 auto 16px',
              boxShadow: '0 8px 30px rgba(194,65,12,0.4)',
            }}>
              <img src="/krishnatejabrickslogo.png" alt="KRISHNATEJA BRICKS" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 style={{
              fontFamily: 'Playfair Display', color: 'white', fontSize: '1.8rem',
              marginBottom: '8px',
            }}>KRISHNATEJA BRICKS</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
              Admin Portal — Sign in to manage your store
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '18px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)' }}>Email Address</label>
              <input
                type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@yourbrickcompany.com"
                required
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                }}
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
              <input
                type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                }}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{
                background: loading ? '#6b7280' : 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white', border: 'none', padding: '16px', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans', marginTop: '8px',
                boxShadow: '0 8px 25px rgba(194,65,12,0.4)',
              }}
            >
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
