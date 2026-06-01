import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  await dbConnect();
  
  if (req.method !== 'GET') return res.status(405).end();
  
  const { code } = req.query;
  if (!code) return res.status(400).json({ success: false, message: 'Order code required' });
  
  const order = await Order.findOne({ orderCode: code.toUpperCase() });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  return res.status(200).json({ success: true, data: order });
}
