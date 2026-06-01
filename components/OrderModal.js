import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function OrderModal({ product, onClose, settings, locations }) {
  const [step, setStep] = useState(1); // 1: details, 2: location, 3: payment, 4: success
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [useDeviceLocation, setUseDeviceLocation] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    quantity: product?.minOrderQty || 100,
    requiresLabour: false,
    selectedLocationId: '',
    isCustomLocation: false,
    customLocationDetails: '',
    deliveryAddress: '',
    paymentMode: 'COD',
    advanceAmount: 0,
    notes: '',
    upiTransactionId: '',
  });

  const pricePerUnit = product?.pricePerUnit || 0;
  const qty = parseInt(form.quantity) || 0;
  const productTotal = qty * pricePerUnit;

  const baseTransport = parseFloat(settings?.baseTransportPrice || 500);
  const pricePerKm = parseFloat(settings?.pricePerKm || 25);
  const labourPerDay = parseFloat(settings?.labourPricePerDay || 800);
  const bricksPerDay = parseFloat(settings?.labourBricksPerDay || 1000);
  const advPct = parseFloat(settings?.advancePercentage || 30);
  const gstPct = parseFloat(settings?.gstPercentage || 0);

  // Transport calculation
  let transportCharge = 0;
  const selectedLoc = locations?.find(l => l._id === form.selectedLocationId);
  if (selectedLoc && selectedLoc.isFixedPrice) {
    transportCharge = selectedLoc.fixedTransportPrice || 0;
  } else if (selectedLoc && selectedLoc.distanceKm) {
    transportCharge = baseTransport + (selectedLoc.distanceKm * pricePerKm);
  } else if (!form.isCustomLocation) {
    transportCharge = 0;
  }

  // Labour calculation
  const labourDays = form.requiresLabour ? Math.ceil(qty / bricksPerDay) : 0;
  const labourCharge = labourDays * labourPerDay;

  const subtotal = productTotal + transportCharge + labourCharge;
  const gstAmount = Math.round(subtotal * gstPct / 100);
  const totalAmount = subtotal + gstAmount;
  const minAdvance = Math.round(totalAmount * advPct / 100);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const getDeviceLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        setForm(f => ({ ...f, customLocationDetails: coords, isCustomLocation: true }));
        toast.success('Location detected! Admin will review transport charges.');
      },
      () => toast.error('Could not detect location. Please type your address.')
    );
  };

  const loadQR = async (type) => {
    setLoading(true);
    try {
      const amount = type === 'advance' ? minAdvance : totalAmount;
      const { data } = await axios.post('/api/payment/qr', {
        amount, orderCode: 'PREVIEW', type,
      });
      setQrData({ ...data, amount, type });
    } catch {
      toast.error('Could not generate QR code. Check UPI settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!form.selectedLocationId && !form.customLocationDetails && !form.isCustomLocation) {
      toast.error('Please select or enter a delivery location');
      return;
    }

    setLoading(true);
    try {
      const items = [{
        productId: product._id,
        productName: product.name,
        quantity: qty,
        pricePerUnit,
        price: productTotal,
      }];

      const payload = {
        ...form,
        items,
        productTotal,
        transportCharge: form.isCustomLocation ? 0 : transportCharge,
        labourCharge,
        labourDays,
        totalAmount: form.isCustomLocation ? productTotal + labourCharge : totalAmount,
        deliveryLocation: selectedLoc ? selectedLoc.name : form.customLocationDetails,
        locationId: selectedLoc?._id || undefined,
        advanceAmount: form.paymentMode === 'UPI_ADVANCE' ? minAdvance : (form.paymentMode === 'UPI_FULL' ? totalAmount : 0),
      };

      const { data } = await axios.post('/api/orders', payload);
      setOrderResult(data.data);
      setStep(4);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%',
        maxWidth: 680, maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1c0a00, #78350f)',
          padding: '24px 28px', color: 'white',
          borderRadius: '24px 24px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', margin: 0 }}>
              🧱 Order {product?.name}
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
              Step {step} of {step === 4 ? 4 : 3}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
            fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Step progress */}
        {step < 4 && (
          <div style={{ display: 'flex', borderBottom: '2px solid #f3f4f6' }}>
            {['Customer Info', 'Location & Extras', 'Payment'].map((s, i) => (
              <div key={i} style={{
                flex: 1, padding: '12px', textAlign: 'center',
                background: step === i+1 ? '#fef3e2' : step > i+1 ? '#d1fae5' : 'white',
                color: step === i+1 ? '#c2410c' : step > i+1 ? '#065f46' : '#9ca3af',
                fontSize: '0.8rem', fontWeight: 600,
                borderRight: i < 2 ? '1px solid #f3f4f6' : 'none',
                transition: 'all 0.3s',
              }}>
                {step > i+1 ? '✓ ' : `${i+1}. `}{s}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '28px' }}>
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <div>
              {/* Price summary */}
              <div style={{
                background: '#fef3e2', borderRadius: '12px', padding: '16px',
                marginBottom: '24px', border: '1px solid #fed7aa',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#78350f' }}>₹{pricePerUnit} per {product?.unit || 'piece'}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Min: {product?.minOrderQty || 100}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label>Quantity ({product?.unit || 'pieces'}) *</label>
                  <input type="number" name="quantity" value={form.quantity}
                    onChange={handleChange} min={product?.minOrderQty || 100}
                    max={product?.maxOrderQty || 100000}
                  />
                  <div style={{ marginTop: '6px', color: '#c2410c', fontWeight: 600 }}>
                    Product Total: ₹{productTotal.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label>Full Name *</label>
                  <input type="text" name="customerName" value={form.customerName}
                    onChange={handleChange} placeholder="Your full name" />
                </div>

                <div>
                  <label>Phone Number *</label>
                  <input type="tel" name="customerPhone" value={form.customerPhone}
                    onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                </div>

                <div>
                  <label>Email (optional - for confirmation)</label>
                  <input type="email" name="customerEmail" value={form.customerEmail}
                    onChange={handleChange} placeholder="your@email.com" />
                </div>

                <div>
                  <label>Special Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange}
                    rows={3} placeholder="Any specific requirements..." />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!form.customerName || !form.customerPhone) { toast.error('Name & phone required'); return; }
                  setStep(2);
                }}
                style={{
                  marginTop: '24px', width: '100%',
                  background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                  color: 'white', border: 'none', padding: '14px', borderRadius: '10px',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Location & Labour */}
          {step === 2 && (
            <div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label>Delivery Location *</label>
                  <select
                    value={form.selectedLocationId}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setForm(f => ({ ...f, selectedLocationId: '', isCustomLocation: true }));
                      } else {
                        setForm(f => ({ ...f, selectedLocationId: e.target.value, isCustomLocation: false, customLocationDetails: '' }));
                      }
                    }}
                  >
                    <option value="">-- Select a location --</option>
                    {(locations || []).map(loc => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name}{loc.district ? `, ${loc.district}` : ''}
                        {loc.isFixedPrice ? ` — Transport: ₹${loc.fixedTransportPrice}` : loc.distanceKm ? ` (~${loc.distanceKm}km)` : ''}
                      </option>
                    ))}
                    <option value="custom">📍 Other Location (Admin will quote)</option>
                  </select>
                </div>

                {form.isCustomLocation && (
                  <div>
                    <label>Your Location / Address</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text" name="customLocationDetails" value={form.customLocationDetails}
                        onChange={handleChange} placeholder="Type your address or use GPS"
                        style={{ flex: 1 }}
                      />
                      <button onClick={getDeviceLocation} style={{
                        background: '#1c0a00', color: 'white', border: 'none',
                        padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                        whiteSpace: 'nowrap', fontSize: '0.85rem',
                      }}>
                        📍 GPS
                      </button>
                    </div>
                    <div style={{
                      marginTop: '8px', padding: '10px 12px', background: '#fef9c3',
                      borderRadius: '8px', fontSize: '0.8rem', color: '#713f12',
                    }}>
                      ℹ️ Admin will review your location and confirm transport charges before finalizing your order.
                    </div>
                  </div>
                )}

                {form.selectedLocationId && selectedLoc && (
                  <div style={{
                    background: '#d1fae5', borderRadius: '10px', padding: '12px',
                    border: '1px solid #a7f3d0',
                  }}>
                    <strong style={{ color: '#065f46' }}>✓ Transport charge: ₹{transportCharge.toLocaleString()}</strong>
                    {selectedLoc.distanceKm && <span style={{ color: '#6b7280', marginLeft: 8, fontSize: '0.8rem' }}>({selectedLoc.distanceKm} km)</span>}
                  </div>
                )}

                <div>
                  <label>Full Delivery Address</label>
                  <textarea name="deliveryAddress" value={form.deliveryAddress}
                    onChange={handleChange} rows={2}
                    placeholder="Street, landmark, area details..." />
                </div>

                <div style={{
                  background: '#f8fafc', borderRadius: '12px', padding: '16px',
                  border: '1px solid #e2e8f0',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: 0 }}>
                    <input type="checkbox" name="requiresLabour" checked={form.requiresLabour}
                      onChange={handleChange} style={{ width: 18, height: 18, accentColor: '#c2410c' }}
                    />
                    <span style={{ color: '#1c0a00', fontSize: '1rem', fontWeight: 600 }}>
                      Add Labour Service (Loading/Unloading)
                    </span>
                  </label>
                  {form.requiresLabour && (
                    <div style={{ marginTop: '10px', color: '#6b7280', fontSize: '0.85rem' }}>
                      <div>{labourDays} day(s) × ₹{labourPerDay} = <strong>₹{labourCharge.toLocaleString()}</strong></div>
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#9ca3af' }}>
                        Based on {bricksPerDay} bricks/day rate
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{
                marginTop: '20px', background: '#fef3e2', borderRadius: '12px',
                padding: '16px', border: '1px solid #fed7aa',
              }}>
                <h4 style={{ marginBottom: '12px', color: '#78350f', fontSize: '1rem' }}>Price Breakdown</h4>
                {[
                  ['Product Total', `₹${productTotal.toLocaleString()}`],
                  ['Transport Charge', form.isCustomLocation ? 'TBD (Admin Review)' : `₹${transportCharge.toLocaleString()}`],
                  ['Labour Charge', `₹${labourCharge.toLocaleString()}`],
                  ...(gstPct > 0 ? [['GST (' + gstPct + '%)', `₹${gstAmount.toLocaleString()}`]] : []),
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem', color: '#6b7280' }}>
                    <span>{k}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{
                  borderTop: '2px dashed #fed7aa', marginTop: '8px', paddingTop: '8px',
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: 'Playfair Display', fontSize: '1.2rem', fontWeight: 700, color: '#c2410c',
                }}>
                  <span>Total</span>
                  <span>{form.isCustomLocation ? 'TBD after review' : `₹${totalAmount.toLocaleString()}`}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, background: 'white', color: '#6b7280', border: '2px solid #e5e7eb',
                  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'DM Sans',
                }}>← Back</button>
                <button onClick={() => setStep(3)} style={{
                  flex: 2, background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                  color: 'white', border: 'none', padding: '12px', borderRadius: '10px',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans',
                }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: '16px', color: '#1c0a00', fontFamily: 'Playfair Display' }}>
                Payment Method
              </h3>

              <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                {[
                  { value: 'COD', label: '💵 Cash on Delivery', desc: 'Pay when order is delivered' },
                  { value: 'UPI_ADVANCE', label: '📱 UPI Advance', desc: `Pay ₹${minAdvance.toLocaleString()} advance (${advPct}%) now` },
                  { value: 'UPI_FULL', label: '✅ UPI Full Payment', desc: `Pay full ₹${totalAmount.toLocaleString()} now` },
                ].map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${form.paymentMode === opt.value ? '#c2410c' : '#e5e7eb'}`,
                    background: form.paymentMode === opt.value ? '#fef3e2' : 'white',
                    transition: 'all 0.2s',
                  }}>
                    <input type="radio" name="paymentMode" value={opt.value}
                      checked={form.paymentMode === opt.value} onChange={handleChange}
                      style={{ accentColor: '#c2410c', width: 18, height: 18 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1c0a00' }}>{opt.label}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {(form.paymentMode === 'UPI_ADVANCE' || form.paymentMode === 'UPI_FULL') && (
                <div style={{ marginBottom: '20px' }}>
                  <button
                    onClick={() => loadQR(form.paymentMode === 'UPI_ADVANCE' ? 'advance' : 'full')}
                    style={{
                      width: '100%', background: '#1c0a00', color: 'white', border: 'none',
                      padding: '12px', borderRadius: '10px', cursor: 'pointer',
                      fontFamily: 'DM Sans', fontWeight: 600,
                    }}
                  >
                    {loading ? '⏳ Generating...' : '📱 Show QR Code & Pay'}
                  </button>

                  {qrData && (
                    <div style={{
                      marginTop: '16px', textAlign: 'center',
                      background: '#f8fafc', borderRadius: '16px', padding: '20px',
                      border: '2px dashed #e2e8f0',
                    }}>
                      <div style={{ marginBottom: '12px', fontWeight: 700, color: '#1c0a00' }}>
                        Scan to Pay ₹{qrData.amount.toLocaleString()}
                      </div>
                      <img src={qrData.qrCode} alt="UPI QR" style={{
                        width: 200, height: 200, borderRadius: '12px',
                        border: '3px solid #c2410c',
                      }} />
                      <div style={{ marginTop: '12px', color: '#6b7280', fontSize: '0.85rem' }}>
                        UPI ID: <strong style={{ color: '#1c0a00' }}>{qrData.upiId}</strong>
                      </div>
                      <a href={qrData.upiUrl} style={{
                        display: 'block', marginTop: '12px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white', padding: '12px', borderRadius: '10px',
                        textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
                      }}>
                        📲 Open UPI App to Pay
                      </a>
                      <div style={{ marginTop: '16px' }}>
                        <label>Enter UPI Transaction ID after payment</label>
                        <input type="text" name="upiTransactionId" value={form.upiTransactionId}
                          onChange={handleChange} placeholder="Transaction ID / UTR number" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setStep(2)} style={{
                  flex: 1, background: 'white', color: '#6b7280', border: '2px solid #e5e7eb',
                  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'DM Sans',
                }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{
                  flex: 2, background: loading ? '#9ca3af' : 'linear-gradient(135deg, #c2410c, #ea580c)',
                  color: 'white', border: 'none', padding: '12px', borderRadius: '10px',
                  fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans',
                }}>
                  {loading ? '⏳ Placing Order...' : '🎯 Confirm Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && orderResult && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem', color: '#065f46', marginBottom: '8px' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Your order has been received. We'll contact you shortly.
              </p>

              <div style={{
                background: 'linear-gradient(135deg, #1c0a00, #78350f)',
                borderRadius: '16px', padding: '24px', color: 'white', marginBottom: '24px',
              }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '6px' }}>YOUR ORDER CODE</div>
                <div style={{
                  fontFamily: 'Playfair Display', fontSize: '2rem', fontWeight: 700,
                  letterSpacing: '3px', color: '#fb923c',
                }}>
                  {orderResult.orderCode}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '6px' }}>
                  Save this code to track your order
                </div>
              </div>

              <div style={{
                background: '#fef3e2', borderRadius: '12px', padding: '16px',
                textAlign: 'left', marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Product</span>
                  <span style={{ fontWeight: 600 }}>{product?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Quantity</span>
                  <span style={{ fontWeight: 600 }}>{form.quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Total Amount</span>
                  <span style={{ fontWeight: 700, color: '#c2410c', fontSize: '1.1rem' }}>
                    ₹{orderResult.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={`/track?code=${orderResult.orderCode}`} style={{
                  flex: 1, background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                  color: 'white', padding: '12px', borderRadius: '10px',
                  textDecoration: 'none', fontWeight: 700, textAlign: 'center',
                }}>
                  Track Order →
                </a>
                <button onClick={onClose} style={{
                  flex: 1, background: 'white', color: '#6b7280', border: '2px solid #e5e7eb',
                  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'DM Sans',
                }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
