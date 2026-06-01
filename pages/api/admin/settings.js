import dbConnect from '../../../lib/dbConnect';
import Settings from '../../../models/Settings';
import { isAdminAuthenticated } from '../../../lib/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const DEFAULT_SETTINGS = [
  { key: 'companyName', value: 'KRISHNATEJA BRICKS', label: 'Company Name', type: 'string' },
  { key: 'companyPhone', value: '+91 93908 50349', label: 'Company Phone', type: 'string' },
  { key: 'companyAddress', value: 'pedha Bommajugunta, nemelur, gummidipoondi tk, tiruvalur district, Tamil Nadu', label: 'Company Address', type: 'string' },
  { key: 'companyEmail', value: 'krishnatejareddy2003@gmail.com', label: 'Company Contact Email', type: 'string' },
  { key: 'logoUrl', value: '', label: 'Company Logo Image (Base64)', type: 'string' },
  { key: 'baseTransportPrice', value: 500, label: 'Base Transport Price (₹)', type: 'number' },
  { key: 'pricePerKm', value: 25, label: 'Price Per KM (₹)', type: 'number' },
  { key: 'labourPricePerDay', value: 800, label: 'Labour Price Per Day (₹)', type: 'number' },
  { key: 'labourBricksPerDay', value: 1000, label: 'Bricks Loaded Per Labour Per Day', type: 'number' },
  { key: 'advancePercentage', value: 30, label: 'Minimum Advance Payment (%)', type: 'number' },
  { key: 'upiId', value: '', label: 'UPI ID for Payments', type: 'string' },
  { key: 'upiName', value: '', label: 'UPI Name (Account Holder)', type: 'string' },
  { key: 'announcementBanner', value: '', label: 'Announcement Banner Text', type: 'string' },
  { key: 'minOrderQty', value: 100, label: 'Minimum Order Quantity', type: 'number' },
  { key: 'gstPercentage', value: 0, label: 'GST Percentage (%)', type: 'number' },
];

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    let settings = await Settings.find({});
    
    // Seed defaults if empty
    if (settings.length === 0) {
      await Settings.insertMany(DEFAULT_SETTINGS);
      settings = await Settings.find({});
    }
    
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    return res.status(200).json({ success: true, data: settingsMap, raw: settings });
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    const updates = req.body; // { key: value, key2: value2 }
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true,
      }
    }));
    await Settings.bulkWrite(ops);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
