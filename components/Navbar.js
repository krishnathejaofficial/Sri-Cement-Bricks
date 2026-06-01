import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar({ settings = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const companyName = settings.companyName || 'Sri Cement Bricks';
  const banner = settings.announcementBanner;
  const navLinks = [
    { href: '#products', label: 'Products' },
    { href: '#about', label: 'About' },
    { href: '#calculator', label: 'Calculator' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        id="site-header"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
        }}
      >
        {/* ── Announcement Banner ── */}
        {banner && (
          <div
            style={{
              background: 'linear-gradient(90deg, #7c1d06, #c2410c, #ea580c, #c2410c, #7c1d06)',
              backgroundSize: '300% auto',
              animation: 'bannerMove 8s linear infinite',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.6px',
              padding: '7px 0',
              textAlign: 'center',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                animation: 'marquee 28s linear infinite',
                paddingLeft: '100%',
              }}
            >
              {banner}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{banner}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{banner}
            </span>
          </div>
        )}

        {/* ── Main Navigation ── */}
        <nav
          style={{
            background: scrolled
              ? 'rgba(18, 6, 0, 0.96)'
              : 'rgba(18, 6, 0, 0.55)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottom: scrolled
              ? '1px solid rgba(194,65,12,0.4)'
              : '1px solid rgba(255,255,255,0.06)',
            transition: 'background 0.4s ease, border-color 0.4s ease',
            padding: '14px 0',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none', flexShrink: 0 }}
            >
              <div
                style={{
                  width: 40, height: 40,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(194,65,12,0.45)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <img 
                      src="/krishnatejabrickslogo.png" 
                      alt="Logo" 
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        const fb = e.target.nextSibling;
                        if (fb) fb.style.display = 'flex';
                      }} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{
                      display: 'none',
                      width: '100%', height: '100%',
                      background: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>🧱</div>
                  </>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    color: '#fff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {companyName}
                </div>
                <div
                  style={{
                    color: '#fb923c',
                    fontSize: '0.6rem',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginTop: '1px',
                  }}
                >
                  Premium Cement Bricks
                </div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div
              className="nav-links-desktop"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="nav-link"
                  style={{
                    color: 'rgba(255,255,255,0.78)',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 500,
                    padding: '7px 14px',
                    borderRadius: '8px',
                    transition: 'color 0.2s, background 0.2s',
                    letterSpacing: '0.1px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.78)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {label}
                </a>
              ))}

              {/* Divider */}
              <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.15)', margin: '0 6px' }} />

              {/* Track Order CTA */}
              <Link
                href="/track"
                style={{
                  background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
                  color: 'white',
                  padding: '9px 20px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  letterSpacing: '0.2px',
                  boxShadow: '0 4px 16px rgba(194,65,12,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(194,65,12,0.55)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(194,65,12,0.4)';
                }}
              >
                🚚 Track Order
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="nav-hamburger"
              aria-label="Toggle menu"
              style={{
                display: 'none',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                width: 40, height: 40,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        {/* ── Mobile Drawer ── */}
        <div
          style={{
            background: 'rgba(12, 4, 0, 0.98)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            maxHeight: isOpen ? '400px' : '0',
            transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
            borderBottom: isOpen ? '1px solid rgba(194,65,12,0.3)' : 'none',
          }}
        >
          <div style={{ padding: '8px 20px 20px' }}>
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  padding: '13px 4px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </a>
            ))}
            <Link
              href="/track"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                marginTop: '16px',
                background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white',
                padding: '14px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 18px rgba(194,65,12,0.4)',
              }}
            >
              🚚 Track Order
            </Link>
          </div>
        </div>
      </header>

      <style jsx global>{`
        @keyframes bannerMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-66.666%); }
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-links-desktop { display: flex !important; }
          .nav-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}
