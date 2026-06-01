import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

const TABS = ['Dashboard', 'Orders', 'Products', 'Locations', 'Settings'];
const TAB_ICONS = ['📊', '📦', '🧱', '📍', '⚙️'];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [settings, setSettings] = useState({});
  const [settingsRaw, setSettingsRaw] = useState([]);
  const [stats, setStats] = useState({});

  const [adminEmail, setAdminEmail] = useState('');

  // Auth check
  useEffect(() => {
    axios.get('/api/admin/check')
      .then((res) => {
        setAdminEmail(res.data.email || '');
        fetchAll();
      })
      .catch(() => router.push('/admin/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, prodRes, locRes, settRes] = await Promise.all([
        axios.get('/api/orders?limit=100', { withCredentials: true }),
        axios.get('/api/products?admin=true', { withCredentials: true }),
        axios.get('/api/locations?admin=true', { withCredentials: true }),
        axios.get('/api/admin/settings', { withCredentials: true }),
      ]);
      setOrders(ordersRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setLocations(locRes.data.data || []);
      setSettings(settRes.data.data || {});
      setSettingsRaw(settRes.data.raw || []);

      // Compute stats
      const ords = ordersRes.data.data || [];
      setStats({
        total: ords.length,
        pending: ords.filter(o => o.status === 'pending').length,
        confirmed: ords.filter(o => o.status === 'confirmed').length,
        delivered: ords.filter(o => o.status === 'delivered').length,
        revenue: ords.filter(o => o.status !== 'cancelled').reduce((a, o) => a + (o.totalAmount || 0), 0),
      });
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await axios.post('/api/admin/logout');
    router.push('/admin/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <>
      <Head><title>Admin — {settings.companyName || 'Brick Store'}</title></Head>
      <div style={{ minHeight: '100vh', background: '#f8f5f2', display: 'flex' }}>

        {/* Sidebar */}
        <div style={{
          width: 240, background: 'linear-gradient(180deg, #1c0a00, #3d1a02)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36, height: 36, background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
              }}>🧱</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Playfair Display' }}>
                  {(settings.companyName || 'Brick Store').length > 16
                    ? (settings.companyName || 'Brick Store').slice(0, 14) + '…'
                    : (settings.companyName || 'Brick Store')}
                </div>
                <div style={{ color: '#f97316', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px' }}>
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px', border: 'none',
                background: activeTab === tab ? 'rgba(194,65,12,0.3)' : 'transparent',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer', marginBottom: '4px', textAlign: 'left',
                fontFamily: 'DM Sans', fontSize: '0.9rem', fontWeight: activeTab === tab ? 600 : 400,
                borderLeft: activeTab === tab ? '3px solid #c2410c' : '3px solid transparent',
                transition: 'all 0.2s',
              }}>
                <span>{TAB_ICONS[i]}</span>{tab}
                {tab === 'Orders' && stats.pending > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#c2410c', color: 'white',
                    borderRadius: '10px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
                  }}>{stats.pending}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ padding: '16px' }}>
            <button onClick={() => window.open('/', '_blank')} style={{
              width: '100%', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px',
              cursor: 'pointer', marginBottom: '8px', fontFamily: 'DM Sans', fontSize: '0.85rem',
            }}>
              🌐 View Website
            </button>
            <button onClick={logout} style={{
              width: '100%', background: 'rgba(239,68,68,0.15)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)', padding: '10px', borderRadius: '8px',
              cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '0.85rem',
            }}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, marginLeft: 240, padding: '32px', overflow: 'auto' }}>
          {activeTab === 'Dashboard' && <DashboardTab stats={stats} orders={orders} />}
          {activeTab === 'Orders' && <OrdersTab orders={orders} onRefresh={fetchAll} />}
          {activeTab === 'Products' && <ProductsTab products={products} onRefresh={fetchAll} />}
          {activeTab === 'Locations' && <LocationsTab locations={locations} onRefresh={fetchAll} />}
          {activeTab === 'Settings' && <SettingsTab settings={settings} settingsRaw={settingsRaw} onRefresh={fetchAll} adminEmail={adminEmail} />}
        </div>
      </div>
    </>
  );
}

// ============ DASHBOARD TAB ============
function DashboardTab({ stats, orders }) {
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#1c0a00', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>Welcome back! Here's what's happening.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Total Orders', value: stats.total, icon: '📦', color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Pending Review', value: stats.pending, icon: '🕐', color: '#d97706', bg: '#fef3c7' },
          { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: '#059669', bg: '#d1fae5' },
          { label: 'Total Revenue', value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: '💰', color: '#c2410c', bg: '#fef3e2' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: 48, height: 48, background: bg, borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', marginBottom: '12px',
            }}>{icon}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f3f4f6' }}>
        <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '20px', color: '#1c0a00' }}>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No orders yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['Order Code', 'Customer', 'Location', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#c2410c', fontWeight: 700 }}>{o.orderCode}</td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#1c0a00' }}>{o.customerName}</td>
                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.875rem' }}>{o.deliveryLocation}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#1c0a00' }}>₹{o.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${o.status}`}>{o.status}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.8rem' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ ORDERS TAB ============
function OrdersTab({ orders, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', adminNotes: '', paymentStatus: '', deliveryDate: '', customTransportQuote: '' });

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const payload = { id: selectedOrder._id };
      if (updateForm.status) payload.status = updateForm.status;
      if (updateForm.adminNotes) payload.adminNotes = updateForm.adminNotes;
      if (updateForm.paymentStatus) payload.paymentStatus = updateForm.paymentStatus;
      if (updateForm.deliveryDate) payload.deliveryDate = updateForm.deliveryDate;
      if (updateForm.customTransportQuote) payload.customTransportQuote = parseFloat(updateForm.customTransportQuote);

      await axios.put('/api/orders', payload, { withCredentials: true });
      toast.success('Order updated!');
      setSelectedOrder(null);
      onRefresh();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#1c0a00' }}>Orders</h1>
        <button onClick={onRefresh} style={{
          background: 'white', border: '1px solid #e5e7eb', padding: '8px 16px',
          borderRadius: '8px', cursor: 'pointer', fontFamily: 'DM Sans',
        }}>🔄 Refresh</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '2px solid',
            borderColor: filter === s ? '#c2410c' : '#e5e7eb',
            background: filter === s ? '#fef3e2' : 'white',
            color: filter === s ? '#c2410c' : '#6b7280',
            cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: filter === s ? 700 : 400,
            fontSize: '0.85rem', textTransform: 'capitalize',
          }}>
            {s} {s !== 'all' && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#9ca3af' }}>
            No orders in this category
          </div>
        ) : filtered.map(order => (
          <div key={order._id} style={{
            background: 'white', borderRadius: '16px', padding: '20px',
            border: `1px solid ${order.status === 'pending' ? '#fed7aa' : '#f3f4f6'}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c2410c', fontSize: '0.95rem' }}>{order.orderCode}</span>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                  {order.isCustomLocation && !order.customLocationReviewed && (
                    <span style={{ background: '#fef9c3', color: '#713f12', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                      📍 Custom Location
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0a00' }}>{order.customerName}</div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{order.customerPhone} • {order.deliveryLocation}</div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>
                  {new Date(order.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', fontWeight: 700, color: '#c2410c' }}>
                  ₹{order.totalAmount?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>{order.paymentMode} • {order.paymentStatus}</div>
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setUpdateForm({ status: order.status, adminNotes: order.adminNotes || '', paymentStatus: order.paymentStatus, deliveryDate: '', customTransportQuote: '' });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white',
                    border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                    fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.85rem',
                  }}
                >
                  Manage →
                </button>
              </div>
            </div>

            {/* Order items preview */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #f3f4f6' }}>
              {(order.items || []).map((item, i) => (
                <span key={i} style={{
                  display: 'inline-block', background: '#fef3e2', color: '#78350f',
                  padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem',
                  fontWeight: 500, marginRight: '6px', marginBottom: '4px',
                }}>
                  {item.productName} × {item.quantity}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }} onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c0a00, #78350f)', padding: '20px 24px', color: 'white',
              borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'Playfair Display', fontSize: '1.2rem' }}>Manage Order</div>
                <div style={{ color: '#fb923c', fontFamily: 'monospace', fontSize: '0.9rem' }}>{selectedOrder.orderCode}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
              }}>✕</button>
            </div>

            <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              <div style={{ background: '#fef3e2', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontWeight: 700, color: '#78350f', marginBottom: '8px' }}>Customer Details</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  <div>👤 {selectedOrder.customerName}</div>
                  <div>📞 {selectedOrder.customerPhone}</div>
                  <div>📍 {selectedOrder.deliveryLocation}</div>
                  {selectedOrder.deliveryAddress && <div style={{ marginTop: '4px' }}>{selectedOrder.deliveryAddress}</div>}
                  {selectedOrder.notes && <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Note: {selectedOrder.notes}</div>}
                </div>
              </div>

              {selectedOrder.isCustomLocation && !selectedOrder.customLocationReviewed && (
                <div>
                  <label style={{ color: '#713f12' }}>📍 Custom Location Transport Quote (₹)</label>
                  <input type="number" value={updateForm.customTransportQuote}
                    onChange={e => setUpdateForm(f => ({ ...f, customTransportQuote: e.target.value }))}
                    placeholder="Enter transport charge for this location"
                  />
                </div>
              )}

              <div>
                <label>Update Status</label>
                <select value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
                  {['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'].map(s => (
                    <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Payment Status</label>
                <select value={updateForm.paymentStatus} onChange={e => setUpdateForm(f => ({ ...f, paymentStatus: e.target.value }))}>
                  {['pending', 'advance_paid', 'fully_paid', 'refunded'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Expected Delivery Date</label>
                <input type="date" value={updateForm.deliveryDate}
                  onChange={e => setUpdateForm(f => ({ ...f, deliveryDate: e.target.value }))} />
              </div>

              <div>
                <label>Admin Notes (visible to customer)</label>
                <textarea value={updateForm.adminNotes}
                  onChange={e => setUpdateForm(f => ({ ...f, adminNotes: e.target.value }))}
                  rows={3} placeholder="Add notes for the customer..." />
              </div>

              <button onClick={handleUpdate} disabled={updating} style={{
                background: updating ? '#9ca3af' : 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white', border: 'none', padding: '14px', borderRadius: '10px',
                fontSize: '1rem', fontWeight: 700, cursor: updating ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans',
              }}>
                {updating ? '⏳ Updating...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ PRODUCTS TAB ============
function ProductsTab({ products, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', pricePerUnit: '', unit: 'piece', category: 'Standard',
    minOrderQty: 100, maxOrderQty: 100000, imageUrl: '', isAvailable: true, isFeatured: false,
    specifications: '{}', sortOrder: 0,
  });

  const resetForm = () => setForm({
    name: '', description: '', pricePerUnit: '', unit: 'piece', category: 'Standard',
    minOrderQty: 100, maxOrderQty: 100000, imageUrl: '', isAvailable: true, isFeatured: false,
    specifications: '{}', sortOrder: 0,
  });

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ ...p, specifications: JSON.stringify(p.specifications || {}, null, 2) });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.pricePerUnit) { toast.error('Name and price required'); return; }
    setSaving(true);
    try {
      let specs = {};
      try { specs = JSON.parse(form.specifications || '{}'); } catch {}
      const payload = { ...form, specifications: specs, pricePerUnit: parseFloat(form.pricePerUnit) };

      if (editProduct) {
        await axios.put('/api/products', { id: editProduct._id, ...payload }, { withCredentials: true });
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', payload, { withCredentials: true });
        toast.success('Product added!');
      }
      setShowForm(false); setEditProduct(null); resetForm(); onRefresh();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products?id=${id}`, { withCredentials: true });
      toast.success('Deleted'); onRefresh();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#1c0a00' }}>Products</h1>
        <button onClick={() => { resetForm(); setEditProduct(null); setShowForm(true); }} style={{
          background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white',
          border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer',
          fontFamily: 'DM Sans', fontWeight: 700,
        }}>+ Add Product</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {products.map(p => (
          <div key={p._id} style={{
            background: 'white', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid #f3f4f6', opacity: p.isAvailable ? 1 : 0.6,
          }}>
            <div style={{
              height: 160, background: '#fef3e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative',
            }}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <span style={{ fontSize: '3rem' }}>🧱</span>}
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: p.isAvailable ? '#d1fae5' : '#fee2e2',
                color: p.isAvailable ? '#065f46' : '#991b1b',
                padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
              }}>
                {p.isAvailable ? 'Available' : 'Unavailable'}
              </div>
              {p.isFeatured && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: '#c2410c', color: 'white',
                  padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                }}>⭐ Featured</div>
              )}
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.7rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{p.category}</div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', fontWeight: 700, color: '#1c0a00' }}>{p.name}</div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', fontWeight: 700, color: '#c2410c', margin: '8px 0' }}>₹{p.pricePerUnit} <span style={{ fontSize: '0.8rem', fontFamily: 'DM Sans', color: '#6b7280' }}>per {p.unit}</span></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(p)} style={{
                  flex: 1, background: '#fef3e2', color: '#c2410c', border: 'none',
                  padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans',
                }}>✏️ Edit</button>
                <button onClick={() => handleDelete(p._id)} style={{
                  background: '#fee2e2', color: '#991b1b', border: 'none',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                }}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧱</div>
            <p>No products yet. Add your first product!</p>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflow: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c0a00, #78350f)',
              padding: '20px 24px', color: 'white', borderRadius: '20px 20px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontFamily: 'Playfair Display', margin: 0 }}>
                {editProduct ? '✏️ Edit Product' : '+ New Product'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
              }}>✕</button>
            </div>

            <div style={{ padding: '24px', display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard Cement Brick" />
                </div>
                <div>
                  <label>Category</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Standard, Premium, Special" />
                </div>
              </div>
              <div>
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label>Price per Unit (₹) *</label>
                  <input type="number" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label>Unit</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="piece, sq ft" />
                </div>
                <div>
                  <label>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label>Min Order Qty</label>
                  <input type="number" value={form.minOrderQty} onChange={e => setForm(f => ({ ...f, minOrderQty: e.target.value }))} />
                </div>
                <div>
                  <label>Max Order Qty</label>
                  <input type="number" value={form.maxOrderQty} onChange={e => setForm(f => ({ ...f, maxOrderQty: e.target.value }))} />
                </div>
              </div>
              <div>
                <label>Product Image</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 8 * 1024 * 1024) {
                        toast.error('Image size must be less than 8MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm(f => ({ ...f, imageUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    style={{ display: 'none' }}
                    id="product-image-upload"
                  />
                  <label
                    htmlFor="product-image-upload"
                    style={{
                      background: '#fef3e2',
                      color: '#c2410c',
                      border: '2px dashed #fed7aa',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fed7aa'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fef3e2'; }}
                  >
                    📤 Choose Direct Image File
                  </label>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fca5a5',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                {form.imageUrl && (
                  <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      style={{
                        height: 120,
                        borderRadius: '12px',
                        border: '2px solid #fed7aa',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label>Specifications (JSON format)</label>
                <textarea rows={3} value={form.specifications} onChange={e => setForm(f => ({ ...f, specifications: e.target.value }))}
                  placeholder='{"Size": "230x110x76mm", "Weight": "3.5kg", "Strength": "35 MPa"}' style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0, textTransform: 'none', fontSize: '1rem', fontWeight: 400, color: '#1c0a00' }}>
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#c2410c' }} />
                  Available for sale
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0, textTransform: 'none', fontSize: '1rem', fontWeight: 400, color: '#1c0a00' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#c2410c' }} />
                  Featured product
                </label>
              </div>
              <button onClick={handleSave} disabled={saving} style={{
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white', border: 'none', padding: '14px', borderRadius: '10px',
                fontSize: '1rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans',
              }}>
                {saving ? '⏳ Saving...' : '💾 Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ LOCATIONS TAB ============
function LocationsTab({ locations, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editLoc, setEditLoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', district: '', state: 'Andhra Pradesh', isFixedPrice: true, fixedTransportPrice: 0, distanceKm: '', isActive: true });

  const resetForm = () => setForm({ name: '', district: '', state: 'Andhra Pradesh', isFixedPrice: true, fixedTransportPrice: 0, distanceKm: '', isActive: true });

  const handleSave = async () => {
    if (!form.name) { toast.error('Location name required'); return; }
    setSaving(true);
    try {
      if (editLoc) {
        await axios.put('/api/locations', { id: editLoc._id, ...form }, { withCredentials: true });
        toast.success('Updated!');
      } else {
        await axios.post('/api/locations', form, { withCredentials: true });
        toast.success('Location added!');
      }
      setShowForm(false); setEditLoc(null); resetForm(); onRefresh();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return;
    try { await axios.delete(`/api/locations?id=${id}`, { withCredentials: true }); toast.success('Deleted'); onRefresh(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#1c0a00' }}>Delivery Locations</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage locations with fixed transport prices. Unlisted locations require admin quote.</p>
        </div>
        <button onClick={() => { resetForm(); setEditLoc(null); setShowForm(true); }} style={{
          background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white',
          border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 700,
        }}>+ Add Location</button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3f4f6' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fef3e2', borderBottom: '2px solid #fed7aa' }}>
              {['Location', 'District', 'State', 'Transport Type', 'Price/Distance', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#78350f' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No locations added yet</td></tr>
            ) : locations.map(loc => (
              <tr key={loc._id} style={{ borderBottom: '1px solid #f9fafb', opacity: loc.isActive ? 1 : 0.5 }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1c0a00' }}>{loc.name}</td>
                <td style={{ padding: '14px 16px', color: '#6b7280' }}>{loc.district || '—'}</td>
                <td style={{ padding: '14px 16px', color: '#6b7280' }}>{loc.state}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: loc.isFixedPrice ? '#dbeafe' : '#ede9fe', color: loc.isFixedPrice ? '#1e40af' : '#5b21b6', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {loc.isFixedPrice ? 'Fixed Price' : 'Per KM'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#c2410c' }}>
                  {loc.isFixedPrice ? `₹${loc.fixedTransportPrice}` : `${loc.distanceKm || '—'} km`}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: loc.isActive ? '#d1fae5' : '#fee2e2', color: loc.isActive ? '#065f46' : '#991b1b', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {loc.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { setEditLoc(loc); setForm({ ...loc }); setShowForm(true); }} style={{
                      background: '#fef3e2', color: '#c2410c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                    }}>✏️</button>
                    <button onClick={() => handleDelete(loc._id)} style={{
                      background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                    }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Location Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: 500, overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c0a00, #78350f)', padding: '20px 24px', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontFamily: 'Playfair Display', margin: 0 }}>{editLoc ? '✏️ Edit Location' : '+ New Location'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '24px', display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label>Location Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tirupati" /></div>
                <div><label>District</label><input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="e.g. Tirupati" /></div>
              </div>
              <div>
                <label>State</label>
                <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', width: '100%' }}>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>
              <div>
                <label>Transport Pricing Type</label>
                <select value={form.isFixedPrice ? 'fixed' : 'perkm'} onChange={e => setForm(f => ({ ...f, isFixedPrice: e.target.value === 'fixed' }))}>
                  <option value="fixed">Fixed Price (set one price for this location)</option>
                  <option value="perkm">Per KM (calculated from base + distance)</option>
                </select>
              </div>
              {form.isFixedPrice ? (
                <div><label>Fixed Transport Price (₹)</label><input type="number" value={form.fixedTransportPrice} onChange={e => setForm(f => ({ ...f, fixedTransportPrice: e.target.value }))} /></div>
              ) : (
                <div><label>Distance from Company (km)</label><input type="number" value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))} /></div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0, textTransform: 'none', fontSize: '1rem', fontWeight: 400, color: '#1c0a00' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#c2410c' }} />
                Active (show in dropdown)
              </label>
              <button onClick={handleSave} disabled={saving} style={{
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: 'white', border: 'none', padding: '14px', borderRadius: '10px',
                fontSize: '1rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans',
              }}>
                {saving ? '⏳ Saving...' : '💾 Save Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ SETTINGS TAB ============
function SettingsTab({ settings, settingsRaw, onRefresh, adminEmail }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  const [credForm, setCredForm] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingCred, setSavingCred] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);
  
  useEffect(() => {
    if (adminEmail) {
      setCredForm(f => ({ ...f, email: adminEmail }));
    }
  }, [adminEmail]);

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!credForm.email) {
      toast.error('Email is required');
      return;
    }
    if (!credForm.password) {
      toast.error('Current password is required to save changes');
      return;
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingCred(true);
    try {
      await axios.put('/api/admin/credentials', credForm, { withCredentials: true });
      toast.success('Admin credentials updated successfully!');
      setCredForm(f => ({ ...f, password: '', newPassword: '', confirmPassword: '' }));
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update credentials');
    } finally {
      setSavingCred(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/admin/settings', form, { withCredentials: true });
      toast.success('Settings saved!');
      onRefresh();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const Field = ({ k, label, type = 'text', hint }) => (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={form[k] !== undefined ? form[k] : ''}
        onChange={e => setForm(f => ({ ...f, [k]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
      />
      {hint && <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>{hint}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#1c0a00' }}>Settings</h1>
        <button onClick={handleSave} disabled={saving} style={{
          background: saving ? '#9ca3af' : 'linear-gradient(135deg, #c2410c, #ea580c)',
          color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px',
          cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', fontWeight: 700,
        }}>
          {saving ? '⏳ Saving...' : '💾 Save All Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Company */}
        <Section title="🏢 Company Information">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', gridColumn: '1 / -1' }}>
            <Field k="companyName" label="Company Name" />
            <Field k="companyPhone" label="Phone Number" />
          </div>
          <Field k="companyAddress" label="Address" />
          <Field k="companyEmail" label="Contact Email" />
          
          <div>
            <label>Company Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              {form.logoUrl ? (
                <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e7e5e4', background: '#fcf8f2' }}>
                  <img src={form.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, logoUrl: '' }))}
                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '0 0 0 8px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '10px', border: '2px dashed #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: '#fffbeb', color: '#ea580c' }}>🧱</div>
              )}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error('Logo image must be smaller than 2MB');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm(f => ({ ...f, logoUrl: reader.result }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  style={{ display: 'none' }}
                  id="logo-upload-input"
                />
                <label htmlFor="logo-upload-input" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: 'white', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', marginBottom: 0 }}>
                  📤 Choose Logo Image
                </label>
                <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '6px' }}>Max 2MB. Stored directly in database.</div>
              </div>
            </div>
          </div>
          
          <Field k="announcementBanner" label="Announcement Banner" hint="Shown at the top of the website. Leave empty to hide." />
        </Section>

        {/* Transport */}
        <Section title="🚚 Transport Pricing">
          <Field k="baseTransportPrice" label="Base Transport Price (₹)" type="number" hint="Base charge for all deliveries regardless of distance" />
          <Field k="pricePerKm" label="Price Per KM (₹)" type="number" hint="Additional charge per kilometer for non-fixed locations" />
        </Section>

        {/* Labour */}
        <Section title="👷 Labour Charges">
          <Field k="labourPricePerDay" label="Labour Price Per Day (₹)" type="number" />
          <Field k="labourBricksPerDay" label="Bricks Per Labour Per Day" type="number" hint="How many bricks one labour can load/unload per day" />
        </Section>

        {/* Payment */}
        <Section title="💳 Payment Settings">
          <Field k="upiId" label="UPI ID" hint="e.g. yourname@upi or yourbusiness@okaxis" />
          <Field k="upiName" label="UPI Account Name" hint="Name shown on payment screen" />
          <Field k="advancePercentage" label="Minimum Advance Payment (%)" type="number" hint="Percentage of total required as advance for UPI advance payment" />
          <Field k="gstPercentage" label="GST Percentage (%)" type="number" hint="Set to 0 if GST is not applicable" />
        </Section>

        {/* Orders */}
        <Section title="📦 Order Settings">
          <Field k="minOrderQty" label="Global Minimum Order Quantity" type="number" />
        </Section>

        {/* Admin Credentials */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f3f4f6', gridColumn: '1 / -1' }}>
          <h3 style={{ fontFamily: 'Playfair Display', color: '#1c0a00', marginBottom: '20px', fontSize: '1.1rem', paddingBottom: '12px', borderBottom: '2px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 Admin Security Credentials
          </h3>
          <form onSubmit={handleSaveCredentials} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Admin Email Address *</label>
              <input
                type="email"
                value={credForm.email}
                onChange={e => setCredForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@email.com"
                required
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Current Password *</label>
              <input
                type="password"
                value={credForm.password}
                onChange={e => setCredForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter current password"
                required
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>New Password (optional)</label>
              <input
                type="password"
                value={credForm.newPassword}
                onChange={e => setCredForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Leave blank to keep"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Confirm New Password</label>
              <input
                type="password"
                value={credForm.confirmPassword}
                onChange={e => setCredForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Leave blank to keep"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', width: '100%' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={savingCred}
                style={{
                  background: savingCred ? '#9ca3af' : 'linear-gradient(135deg, #1c0a00, #3d1a02)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  cursor: savingCred ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {savingCred ? '⏳ Saving...' : '🔒 Update Credentials'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <button onClick={handleSave} disabled={saving} style={{
          background: saving ? '#9ca3af' : 'linear-gradient(135deg, #c2410c, #ea580c)',
          color: 'white', border: 'none', padding: '14px 32px', borderRadius: '10px',
          cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '1rem',
        }}>
          {saving ? '⏳ Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f3f4f6' }}>
      <h3 style={{ fontFamily: 'Playfair Display', color: '#1c0a00', marginBottom: '20px', fontSize: '1.1rem', paddingBottom: '12px', borderBottom: '2px solid #fef3e2' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {children}
      </div>
    </div>
  );
}
