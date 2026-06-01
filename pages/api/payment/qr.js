import QRCode from 'qrcode';
import dbConnect from '../../../lib/dbConnect';
import Settings from '../../../models/Settings';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  await dbConnect();
  
  const { amount, orderCode, type } = req.body; // type: 'advance' | 'full'
  
  const settings = await Settings.find({ key: { $in: ['upiId', 'upiName', 'companyName'] } });
  const settingsMap = {};
  settings.forEach(s => { settingsMap[s.key] = s.value; });
  
  const upiId = settingsMap.upiId || process.env.NEXT_PUBLIC_UPI_ID || '';
  const upiName = settingsMap.upiName || settingsMap.companyName || 'Cement Bricks';
  
  if (!upiId) {
    return res.status(400).json({ success: false, message: 'UPI ID not configured' });
  }
  
  // UPI deep link format
  const note = `Order ${orderCode} - ${type === 'advance' ? 'Advance' : 'Full'} Payment`;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#1c1c1c', light: '#ffffff' }
    });
    
    return res.status(200).json({
      success: true,
      qrCode: qrDataUrl,
      upiUrl,
      upiId,
      upiName,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'QR generation failed' });
  }
}
