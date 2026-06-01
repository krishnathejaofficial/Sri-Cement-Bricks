import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered'];
const STATUS_INFO = {
  pending: { icon: '🕐', label: 'Order Pending', color: '#d97706', bg: '#fef3c7', desc: 'Your order has been received and is awaiting confirmation.' },
  confirmed: { icon: '✅', label: 'Order Confirmed', color: '#1d4ed8', bg: '#dbeafe', desc: 'Your order has been confirmed by our team.' },
  processing: { icon: '🏭', label: 'Processing', color: '#6d28d9', bg: '#ede9fe', desc: 'Your bricks are being prepared.' },
  dispatched: { icon: '🚚', label: 'Dispatched', color: '#be185d', bg: '#fce7f3', desc: 'Your order is on the way!' },
  delivered: { icon: '🎉', label: 'Delivered', color: '#065f46', bg: '#d1fae5', desc: 'Order delivered successfully!' },
  cancelled: { icon: '❌', label: 'Cancelled', color: '#991b1b', bg: '#fee2e2', desc: 'This order has been cancelled.' },
};

export default function TrackOrder() {
  const router = useRouter();
  const [code, setCode] = useState(router.query.code || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await axios.get(`/api/orders/track?code=${code.trim().toUpperCase()}`);
      setOrder(data.data);
    } catch {
      setError('Order not found. Please check your order code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const statusInfo = order ? (STATUS_INFO[order.status] || STATUS_INFO.pending) : null;

  return (
    <>
      <Head>
        <title>Track Your Order — KRISHNATEJA BRICKS</title>
        <link rel="icon" href="/krishnatejabrickslogo.png" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1c0a00, #3d1a02, #78350f)',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              ← Back to Home
            </Link>
            <div style={{ color: 'rgba(255,255,255,0.3)' }}>|</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/krishnatejabrickslogo.png" alt="KRISHNATEJA BRICKS" style={{ width: 26, height: 26, borderRadius: '6px', objectFit: 'cover' }} />
              <span style={{ fontFamily: 'Playfair Display', color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>Order Tracker</span>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '60px 24px', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              fontFamily: 'Playfair Display', color: 'white',
              fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '12px',
            }}>
              Track Your Order
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Enter your order code to see real-time status
            </p>
          </div>

          {/* Search box */}
          <div style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px',
            padding: '24px', marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. SCB-20240101-1234"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '1.1rem',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  background: loading ? '#6b7280' : 'linear-gradient(135deg, #c2410c, #ea580c)',
                  color: 'white', border: 'none', padding: '14px 28px',
                  borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '1rem', fontFamily: 'DM Sans',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '⏳' : 'Track →'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '12px',
              textAlign: 'center', marginBottom: '24px',
            }}>
              ❌ {error}
            </div>
          )}

          {order && (
            <div style={{
              background: 'white', borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
            }}>
              {/* Order header */}
              <div style={{
                background: statusInfo.bg,
                padding: '24px 28px',
                borderBottom: '2px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>ORDER CODE</div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700,
                      color: '#1c0a00', letterSpacing: '2px',
                    }}>
                      {order.orderCode}
                    </div>
                  </div>
                  <div style={{
                    background: statusInfo.bg,
                    border: `2px solid ${statusInfo.color}`,
                    color: statusInfo.color,
                    padding: '8px 18px', borderRadius: '30px',
                    fontWeight: 700, fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    {statusInfo.icon} {statusInfo.label}
                  </div>
                </div>
                <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '0.9rem' }}>
                  {statusInfo.desc}
                </p>
              </div>

              {/* Progress tracker */}
              {order.status !== 'cancelled' && (
                <div style={{ padding: '28px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {STATUS_STEPS.map((s, i) => {
                      const info = STATUS_INFO[s];
                      const done = i <= currentStepIndex;
                      const active = i === currentStepIndex;
                      return (
                        <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{
                              position: 'absolute', top: 17, left: '50%', width: '100%',
                              height: 3,
                              background: i < currentStepIndex ? '#c2410c' : '#e5e7eb',
                              transition: 'background 0.5s',
                            }} />
                          )}
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', margin: '0 auto 8px',
                            background: done ? (active ? '#c2410c' : '#d97706') : '#e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: done ? '1rem' : '0.8rem',
                            color: done ? 'white' : '#9ca3af',
                            position: 'relative', zIndex: 1,
                            border: active ? '3px solid #c2410c' : '3px solid transparent',
                            boxShadow: active ? '0 0 0 4px rgba(194,65,12,0.2)' : 'none',
                            transition: 'all 0.3s',
                          }}>
                            {done ? (active ? info.icon : '✓') : (i + 1)}
                          </div>
                          <div style={{
                            fontSize: '0.65rem', color: done ? '#1c0a00' : '#9ca3af',
                            fontWeight: done ? 600 : 400, lineHeight: 1.3,
                          }}>
                            {info.label.replace('Order ', '')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order details */}
              <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Customer</div>
                    <div style={{ fontWeight: 700, color: '#1c0a00' }}>{order.customerName}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{order.customerPhone}</div>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Delivery Location</div>
                    <div style={{ fontWeight: 600, color: '#1c0a00' }}>{order.deliveryLocation}</div>
                    {order.deliveryAddress && <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{order.deliveryAddress}</div>}
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Order Date</div>
                    <div style={{ fontWeight: 600, color: '#1c0a00' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Payment</div>
                    <div style={{ fontWeight: 600, color: '#1c0a00' }}>{order.paymentMode}</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <span className={`badge badge-${order.paymentStatus === 'fully_paid' ? 'delivered' : 'pending'}`}>
                        {order.paymentStatus?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ background: '#fef3e2', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, color: '#78350f', marginBottom: '12px', fontSize: '0.9rem' }}>ORDER ITEMS</div>
                  {(order.items || []).map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px dashed #fed7aa' : 'none',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1c0a00' }}>{item.productName}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{item.quantity} units × ₹{item.pricePerUnit}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#c2410c' }}>₹{item.price?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '16px' }}>
                  {[
                    ['Product Total', order.productTotal],
                    ['Transport', order.transportCharge],
                    ['Labour', order.labourCharge],
                  ].map(([k, v]) => v > 0 && (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '6px', fontSize: '0.9rem' }}>
                      <span>{k}</span><span>₹{v?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontFamily: 'Playfair Display', fontSize: '1.3rem', fontWeight: 700,
                    color: '#c2410c', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #fed7aa',
                  }}>
                    <span>Total</span>
                    <span>₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {order.isCustomLocation && !order.customLocationReviewed && (
                  <div style={{
                    marginTop: '16px', background: '#fef9c3', borderRadius: '10px',
                    padding: '12px 16px', color: '#713f12', fontSize: '0.875rem',
                  }}>
                    ⏳ <strong>Transport charge pending:</strong> Admin is reviewing your custom location. Transport price will be confirmed shortly.
                  </div>
                )}

                {order.adminNotes && (
                  <div style={{
                    marginTop: '12px', background: '#dbeafe', borderRadius: '10px',
                    padding: '12px 16px', color: '#1e40af', fontSize: '0.875rem',
                  }}>
                    💬 <strong>Note from us:</strong> {order.adminNotes}
                  </div>
                )}

                {order.deliveryDate && (
                  <div style={{
                    marginTop: '12px', background: '#d1fae5', borderRadius: '10px',
                    padding: '12px 16px', color: '#065f46', fontSize: '0.875rem',
                  }}>
                    📅 <strong>Expected Delivery:</strong> {new Date(order.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
