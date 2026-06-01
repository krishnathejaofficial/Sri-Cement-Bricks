import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import Settings from '../../../models/Settings';
import { isAdminAuthenticated } from '../../../lib/auth';
import { sendOrderNotificationToAdmin, sendOrderConfirmationToCustomer } from '../../../lib/email';
import { v4 as uuidv4 } from 'uuid';

function generateOrderCode() {
  const prefix = 'SCB';
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${random}`;
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Admin: get all orders
    if (isAdminAuthenticated(req)) {
      const { status, page = 1, limit = 20 } = req.query;
      const query = status && status !== 'all' ? { status } : {};
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      const total = await Order.countDocuments(query);
      return res.status(200).json({ success: true, data: orders, total });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const orderData = req.body;
    orderData.orderCode = generateOrderCode();
    orderData.statusHistory = [{ status: 'pending', note: 'Order placed by customer' }];
    
    const order = await Order.create(orderData);
    
    // Send emails asynchronously
    sendOrderNotificationToAdmin(order).catch(console.error);
    if (order.customerEmail) {
      sendOrderConfirmationToCustomer(order, order.customerEmail).catch(console.error);
    }
    
    return res.status(201).json({ success: true, data: order, orderCode: order.orderCode });
  }

  if (req.method === 'PUT') {
    if (!isAdminAuthenticated(req)) return res.status(401).json({ success: false });
    const { id, status, adminNotes, paymentStatus, deliveryDate, customTransportQuote } = req.body;
    
    const update = {};
    if (status) {
      update.status = status;
      update.$push = { statusHistory: { status, note: adminNotes || '', updatedAt: new Date() } };
    }
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (deliveryDate) update.deliveryDate = deliveryDate;
    if (customTransportQuote !== undefined) {
      update.customTransportQuote = customTransportQuote;
      update.customLocationReviewed = true;
      update.transportCharge = customTransportQuote;
      
      const existingOrder = await Order.findById(id);
      if (existingOrder) {
        const gstSetting = await Settings.findOne({ key: 'gstPercentage' });
        const gstPct = gstSetting ? parseFloat(gstSetting.value) || 0 : 0;
        
        const subtotal = existingOrder.productTotal + customTransportQuote + existingOrder.labourCharge;
        const gstAmount = Math.round(subtotal * gstPct / 100);
        update.totalAmount = subtotal + gstAmount;
      }
    }
    
    const order = await Order.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ success: true, data: order });
  }

  res.status(405).end();
}
