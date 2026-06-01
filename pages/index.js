import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dbConnect from '../lib/dbConnect';
import Product from '../models/Product';
import Location from '../models/Location';
import Settings from '../models/Settings';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';

export async function getServerSideProps() {
  try {
    await dbConnect();
    const [productsDoc, locationsDoc, settingsDoc] = await Promise.all([
      Product.find({ isAvailable: true }).sort({ sortOrder: 1, createdAt: -1 }),
      Location.find({ isActive: true }).sort({ name: 1 }),
      Settings.find({}),
    ]);

    const settingsMap = {};
    settingsDoc.forEach(s => { settingsMap[s.key] = s.value; });

    return {
      props: {
        products: JSON.parse(JSON.stringify(productsDoc || [])),
        locations: JSON.parse(JSON.stringify(locationsDoc || [])),
        settings: JSON.parse(JSON.stringify(settingsMap || {})),
      }
    };
  } catch (err) {
    console.error('Error in getServerSideProps:', err);
    return { props: { products: [], locations: [], settings: {} } };
  }
}

export default function Home({ products, locations, settings }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [trackCode, setTrackCode] = useState('');

  const companyName = settings.companyName || 'Sri Cement Bricks';
  const banner = settings.announcementBanner;

  return (
    <>
      <Head>
        <title>{companyName} — Premium Cement Bricks</title>
        <meta name="description" content={`Order premium cement bricks from ${companyName}. Fast delivery across Andhra Pradesh.`} />
      </Head>

      <Navbar settings={settings} />

      {/* HERO SECTION */}
      <section style={{
        minHeight: '100vh',
        background: 'var(--gradient-hero)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
        paddingTop: '130px',
      }}>
        {/* Animated brick pattern background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(255,165,0,1) 38px, rgba(255,165,0,1) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 78px, rgba(255,165,0,1) 78px, rgba(255,165,0,1) 80px)`,
        }} />

        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,88,12,0.3) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(194,65,12,0.2) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(194,65,12,0.3)', border: '1px solid rgba(234,88,12,0.5)',
              padding: '8px 18px', borderRadius: '30px', marginBottom: '24px',
            }}>
              <span style={{ color: '#fb923c', fontSize: '0.85rem', fontWeight: 600 }}>
                🧱 Premium Quality Since 2010
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900, color: 'white', lineHeight: 1.1,
              marginBottom: '24px',
            }}>
              Build Strong,<br />
              <span style={{ color: '#fb923c' }}>Build Right.</span>
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem',
              maxWidth: 520, lineHeight: 1.7, marginBottom: '40px',
            }}>
              Premium cement bricks for every construction need. Delivered across Andhra Pradesh with guaranteed quality and timely service.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#products" style={{
                background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white', padding: '16px 36px', borderRadius: '12px',
                textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                boxShadow: '0 8px 30px rgba(194,65,12,0.5)',
                transition: 'transform 0.2s',
                animation: 'pulse-glow 2s infinite',
              }}>
                View Products →
              </a>
              <Link href="/track" style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white', padding: '16px 36px', borderRadius: '12px',
                textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                backdropFilter: 'blur(10px)',
              }}>
                Track Order
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: '40px', marginTop: '60px',
              flexWrap: 'wrap',
            }}>
              {[
                ['10,000+', 'Orders Delivered'],
                ['50+', 'Locations Served'],
                ['100%', 'Quality Guaranteed'],
              ].map(([num, label]) => (
                <div key={label}>
                  <div style={{
                    fontFamily: 'Playfair Display', fontSize: '2rem',
                    fontWeight: 700, color: '#fb923c',
                  }}>{num}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '30px', left: '50%',
          transform: 'translateX(-50%)', textAlign: 'center',
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem',
            letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase',
          }}>Scroll Down</div>
          <div style={{
            width: 1, height: 50, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
            margin: '0 auto',
          }} />
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" style={{ padding: '80px 0', background: '#fffbf5' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              color: '#c2410c', fontWeight: 700, fontSize: '0.85rem',
              letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px',
            }}>
              Our Products
            </div>
            <h2 style={{
              fontFamily: 'Playfair Display', fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700, color: '#1c0a00', marginBottom: '16px',
            }}>
              Choose Your Perfect Brick
            </h2>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto', fontSize: '1rem' }}>
              Engineered for strength, crafted for quality — our range of cement bricks suits every project.
            </p>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧱</div>
              <p>Products will appear here once added by admin.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '28px',
            }}>
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onOrder={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PRICE CALCULATOR SECTION */}
      <section id="calculator" style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #1c0a00, #3d1a02)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 50%, #c2410c 0%, transparent 50%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'Playfair Display', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: 'white', marginBottom: '12px',
            }}>
              Quick Price Calculator
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Estimate your project cost instantly
            </p>
          </div>
          <QuickCalculator products={products} settings={settings} locations={locations} />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="responsive-grid-2" style={{
            alignItems: 'center',
          }}>
            <div>
              <div style={{ color: '#c2410c', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
                About Us
              </div>
              <h2 style={{
                fontFamily: 'Playfair Display', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: 700, color: '#1c0a00', marginBottom: '20px',
              }}>
                Built on Trust,<br />Strengthened by Quality
              </h2>
              <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: '16px' }}>
                {settings.companyName || companyName} has been providing premium quality cement bricks across Andhra Pradesh for over a decade. Our bricks are manufactured with the finest materials and tested to meet industry standards.
              </p>
              <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: '32px' }}>
                We provide end-to-end service — from manufacturing to delivery at your doorstep, with optional loading/unloading labour support.
              </p>

              <div className="responsive-grid-4-small">
                {[
                  { icon: '🏭', text: 'In-house Manufacturing' },
                  { icon: '🚚', text: 'Pan-AP Delivery' },
                  { icon: '👷', text: 'Labour Services' },
                  { icon: '💎', text: 'Quality Assured' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px', background: '#fef3e2', borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#78350f' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(145deg, #fef3e2, #fff7ed)',
              borderRadius: '24px', padding: '40px',
              border: '2px solid #fed7aa',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🏗️</div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: '#1c0a00', marginBottom: '16px' }}>
                Contact Us
              </h3>
              <div style={{ color: '#6b7280', lineHeight: 2 }}>
                <div>📞 {settings.companyPhone || '+91 XXXXX XXXXX'}</div>
                <div>📍 {settings.companyAddress || 'Chittoor, Andhra Pradesh'}</div>
                <div>📧 {process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''}</div>
              </div>
              <a href="#products" style={{
                display: 'inline-block', marginTop: '24px',
                background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white', padding: '14px 32px', borderRadius: '10px',
                textDecoration: 'none', fontWeight: 700,
              }}>
                Order Now →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT/TRACK FOOTER BAND */}
      <section id="contact" style={{
        background: '#1c0a00', padding: '60px 0',
        borderTop: '1px solid rgba(194,65,12,0.3)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'Playfair Display', color: 'white',
            fontSize: '1.8rem', marginBottom: '12px',
          }}>
            Track Your Order
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
            Enter your order code to check status
          </p>
          <div style={{ display: 'flex', gap: '12px', maxWidth: 400, margin: '0 auto' }}>
            <input
              type="text"
              value={trackCode}
              onChange={e => setTrackCode(e.target.value.toUpperCase())}
              placeholder="e.g. SCB-20240101-1234"
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              onKeyDown={e => e.key === 'Enter' && trackCode && (window.location.href = `/track?code=${trackCode}`)}
            />
            <button
              onClick={() => trackCode && (window.location.href = `/track?code=${trackCode}`)}
              style={{
                background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white', border: 'none', padding: '12px 24px',
                borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: 700, fontFamily: 'DM Sans',
              }}
            >
              Track →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0f0500', padding: '24px',
        color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '0.85rem',
      }}>
        © {new Date().getFullYear()} {companyName}. All rights reserved.
      </footer>

      {/* Order Modal */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          settings={settings}
          locations={locations}
        />
      )}
    </>
  );
}

// Quick Calculator Component (inline)
function QuickCalculator({ products, settings, locations }) {
  const [calc, setCalc] = useState({
    productId: products[0]?._id || '',
    quantity: 500,
    locationId: '',
    requiresLabour: false,
  });

  const product = products.find(p => p._id === calc.productId);
  const location = locations.find(l => l._id === calc.locationId);

  const pricePerUnit = product?.pricePerUnit || 0;
  const qty = parseInt(calc.quantity) || 0;
  const productTotal = qty * pricePerUnit;

  const baseTransport = parseFloat(settings?.baseTransportPrice || 500);
  const pricePerKm = parseFloat(settings?.pricePerKm || 25);
  const labourPerDay = parseFloat(settings?.labourPricePerDay || 800);
  const bricksPerDay = parseFloat(settings?.labourBricksPerDay || 1000);

  let transportCharge = 0;
  if (location?.isFixedPrice) transportCharge = location.fixedTransportPrice || 0;
  else if (location?.distanceKm) transportCharge = baseTransport + location.distanceKm * pricePerKm;

  const labourDays = calc.requiresLabour ? Math.ceil(qty / bricksPerDay) : 0;
  const labourCharge = labourDays * labourPerDay;
  const total = productTotal + transportCharge + labourCharge;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)', padding: '32px',
      maxWidth: 800, margin: '0 auto',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.6)' }}>Brick Type</label>
          <select value={calc.productId} onChange={e => setCalc(c => ({ ...c, productId: e.target.value }))}
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            {products.map(p => <option key={p._id} value={p._id} style={{ color: '#000' }}>{p.name} — ₹{p.pricePerUnit}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.6)' }}>Quantity</label>
          <input type="number" value={calc.quantity}
            onChange={e => setCalc(c => ({ ...c, quantity: e.target.value }))}
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </div>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.6)' }}>Location</label>
          <select value={calc.locationId} onChange={e => setCalc(c => ({ ...c, locationId: e.target.value }))}
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <option value="">-- Select --</option>
            {locations.map(l => <option key={l._id} value={l._id} style={{ color: '#000' }}>{l.name}{l.isFixedPrice ? ` (₹${l.fixedTransportPrice})` : ''}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0 }}>
            <input type="checkbox" checked={calc.requiresLabour}
              onChange={e => setCalc(c => ({ ...c, requiresLabour: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: '#c2410c' }}
            />
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>Add Labour</span>
          </label>
        </div>
      </div>

      <div style={{
        background: 'rgba(194,65,12,0.2)', borderRadius: '12px', padding: '20px',
        border: '1px solid rgba(194,65,12,0.4)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px',
      }}>
        {[
          ['Product Cost', `₹${productTotal.toLocaleString()}`],
          ['Transport', location ? `₹${transportCharge.toLocaleString()}` : '—'],
          ['Labour', `₹${labourCharge.toLocaleString()}`],
          ['TOTAL', `₹${total.toLocaleString()}`],
        ].map(([k, v], i) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{k}</div>
            <div style={{
              fontFamily: 'Playfair Display', fontWeight: 700,
              fontSize: i === 3 ? '1.8rem' : '1.3rem',
              color: i === 3 ? '#fb923c' : 'white',
              marginTop: '4px',
            }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
